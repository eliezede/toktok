import { TranscoderServiceClient } from "@google-cloud/video-transcoder";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { onObjectFinalized } from "firebase-functions/v2/storage";

initializeApp();

// Definir região padrão global para todas as funções v2
setGlobalOptions({ region: "us-central1" });

const transcoderClient = new TranscoderServiceClient();
const db = getFirestore();

/**
 * Trigger disparado quando um novo vídeo é finalizado no storage.
 * Inicia o job de transcodificação para HLS.
 */
export const onVideoUploaded = onObjectFinalized(async (event: any) => {
    const object = event.data;
    const filePath = object.name; // Ex: uploads/videos/{userId}/{videoId}/original.mp4
    const contentType = object.contentType;

    // 1. Filtros de Proteção (Brasil Choice)
    if (!filePath) return console.log("Path inválido");
    if (!filePath.startsWith("uploads/videos/")) return console.log("Ignorando path fora de uploads/videos/");
    if (!contentType || !contentType.startsWith("video/")) return console.log("Ignorando arquivo que não é vídeo");

    const pathParts = filePath.split("/");
    // Expected: uploads/videos/{userId}/{videoId}/original.mp4
    if (pathParts.length < 5) return console.log("Estrutura de diretórios inesperada");

    const userId = pathParts[2];
    const videoId = pathParts[3];

    const videoDocRef = db.collection("videos").doc(videoId);

    try {
        // 2. Idempotência: Checar se já processamos ou estamos processando
        const doc = await videoDocRef.get();
        const data = doc.data();

        if (data?.status === "transcoding" || data?.status === "ready" || data?.jobName) {
            return console.log(`Job já existe ou está pronto para videoId: ${videoId}`);
        }

        console.log(`Iniciando pipeline para videoId: ${videoId} do usuário: ${userId}`);

        // 3. Configuração do Job de Transcodificação
        const projectId = "blueprint-48f27";
        const location = "us-central1";
        const inputUri = `gs://${object.bucket}/${filePath}`;
        const outputUri = `gs://${object.bucket}/processed/videos/${userId}/{videoId}/hls/`;

        const request = {
            parent: transcoderClient.locationPath(projectId, location),
            job: {
                inputUri: inputUri,
                outputUri: outputUri,
                templateId: "preset/web-hls-720p",
                pubsubTarget: `projects/${projectId}/topics/transcoder-notifications`
            },
        };

        // 4. Criar o Job e atualizar Firestore
        const [job] = await transcoderClient.createJob(request);

        await videoDocRef.set({
            status: "transcoding",
            jobName: job.name,
            storagePathOriginal: filePath,
            storagePathProcessed: `processed/videos/${userId}/{videoId}/hls/`,
            processingStartedAt: FieldValue.serverTimestamp(),
            userId: userId,
            videoId: videoId,
            playbackType: "hls"
        }, { merge: true });

        console.log(`✅ Job de transcodificação criado: ${job.name}`);
    } catch (error: any) {
        console.error("❌ Erro ao criar job de transcodificação:", error);
        await videoDocRef.set({
            status: "failed",
            errorCode: error.code || "unknown",
            errorMessage: error.message || "Erro desconhecido no backend",
            processingCompletedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
    }
});

/**
 * Trigger disparado pelo Pub/Sub quando um job do Transcoder termina.
 */
export const onTranscodeComplete = onMessagePublished("transcoder-notifications", async (event: any) => {
    const data = event.data.message.json as any;

    const jobName = data.job?.name;
    const state = data.job?.state;

    if (!jobName) return console.error("Job name não encontrado na mensagem Pub/Sub");

    console.log(`Recebida notificação do Transcoder: ${jobName} - Estado: ${state}`);

    const snapshot = await db.collection("videos").where("jobName", "==", jobName).limit(1).get();

    if (snapshot.empty) {
        return console.error(`Nenhum vídeo encontrado para o jobName: ${jobName}`);
    }

    const doc = snapshot.docs[0];
    const videoData = doc.data();

    if (state === "SUCCEEDED") {
        const jobDetails = data.job;

        await doc.ref.set({
            status: "ready",
            processingCompletedAt: FieldValue.serverTimestamp(),
            playbackUrl: `https://storage.googleapis.com/blueprint-48f27.firebasestorage.app/processed/videos/${videoData.userId}/${videoData.videoId}/hls/main.m3u8`,
            jobStatus: state,
            durationSec: jobDetails?.duration?.seconds || null,
        }, { merge: true });

        console.log(`✅ Vídeo ${doc.id} marcado como PRONTO.`);
    } else if (state === "FAILED") {
        await doc.ref.set({
            status: "failed",
            jobStatus: state,
            errorMessage: data.job?.error?.message || "Transcodificação falhou via API",
            processingCompletedAt: FieldValue.serverTimestamp(),
        }, { merge: true });

        console.error(`❌ Transcodificação falhou para o vídeo ${doc.id}`);
    }
});
