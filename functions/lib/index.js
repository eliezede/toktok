"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onTranscodeComplete = exports.onVideoUploaded = void 0;
const video_transcoder_1 = require("@google-cloud/video-transcoder");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const v2_1 = require("firebase-functions/v2");
const pubsub_1 = require("firebase-functions/v2/pubsub");
const storage_1 = require("firebase-functions/v2/storage");
(0, app_1.initializeApp)();
(0, v2_1.setGlobalOptions)({ region: "us-central1" });
const transcoderClient = new video_transcoder_1.TranscoderServiceClient();
const db = (0, firestore_1.getFirestore)();
exports.onVideoUploaded = (0, storage_1.onObjectFinalized)(async (event) => {
    const object = event.data;
    const filePath = object.name;
    const contentType = object.contentType;
    if (!filePath)
        return console.log("Path inválido");
    if (!filePath.startsWith("uploads/videos/"))
        return console.log("Ignorando path fora de uploads/videos/");
    if (!contentType || !contentType.startsWith("video/"))
        return console.log("Ignorando arquivo que não é vídeo");
    const pathParts = filePath.split("/");
    if (pathParts.length < 5)
        return console.log("Estrutura de diretórios inesperada");
    const userId = pathParts[2];
    const videoId = pathParts[3];
    const videoDocRef = db.collection("videos").doc(videoId);
    try {
        const doc = await videoDocRef.get();
        const data = doc.data();
        if (data?.status === "transcoding" || data?.status === "ready" || data?.jobName) {
            return console.log(`Job já existe ou está pronto para videoId: ${videoId}`);
        }
        console.log(`Iniciando pipeline para videoId: ${videoId} do usuário: ${userId}`);
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
        const [job] = await transcoderClient.createJob(request);
        await videoDocRef.set({
            status: "transcoding",
            jobName: job.name,
            storagePathOriginal: filePath,
            storagePathProcessed: `processed/videos/${userId}/{videoId}/hls/`,
            processingStartedAt: firestore_1.FieldValue.serverTimestamp(),
            userId: userId,
            videoId: videoId,
            playbackType: "hls"
        }, { merge: true });
        console.log(`✅ Job de transcodificação criado: ${job.name}`);
    }
    catch (error) {
        console.error("❌ Erro ao criar job de transcodificação:", error);
        await videoDocRef.set({
            status: "failed",
            errorCode: error.code || "unknown",
            errorMessage: error.message || "Erro desconhecido no backend",
            processingCompletedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
});
exports.onTranscodeComplete = (0, pubsub_1.onMessagePublished)("transcoder-notifications", async (event) => {
    const data = event.data.message.json;
    const jobName = data.job?.name;
    const state = data.job?.state;
    if (!jobName)
        return console.error("Job name não encontrado na mensagem Pub/Sub");
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
            processingCompletedAt: firestore_1.FieldValue.serverTimestamp(),
            playbackUrl: `https://storage.googleapis.com/blueprint-48f27.firebasestorage.app/processed/videos/${videoData.userId}/${videoData.videoId}/hls/main.m3u8`,
            jobStatus: state,
            durationSec: jobDetails?.duration?.seconds || null,
        }, { merge: true });
        console.log(`✅ Vídeo ${doc.id} marcado como PRONTO.`);
    }
    else if (state === "FAILED") {
        await doc.ref.set({
            status: "failed",
            jobStatus: state,
            errorMessage: data.job?.error?.message || "Transcodificação falhou via API",
            processingCompletedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.error(`❌ Transcodificação falhou para o vídeo ${doc.id}`);
    }
});
//# sourceMappingURL=index.js.map