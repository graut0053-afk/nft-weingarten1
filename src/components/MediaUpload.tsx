import { useState, useEffect } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  getMetadata,
} from "firebase/storage";
import type { StorageReference } from "firebase/storage";
import { storage } from "../firebase";
import { v4 as uuidv4 } from "uuid";

interface MediaItem {
  url: string;
  type: string;
}

function MediaUpload() {
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [mediaUrls, setMediaUrls] = useState<MediaItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const mediaListRef = ref(storage, "media/");

  /* ---------------- Upload ---------------- */
  const uploadFile = () => {
    if (!fileUpload) return;

    const fileRef = ref(storage, `media/${uuidv4()}_${fileUpload.name}`);
    const uploadTask = uploadBytesResumable(fileRef, fileUpload);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => console.error("Upload failed:", error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        setMediaUrls((prev) => [
          ...prev,
          { url: downloadURL, type: fileUpload.type },
        ]);

        setUploadProgress(0);
        setFileUpload(null);
      }
    );
  };

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await listAll(mediaListRef);

        const items: Array<MediaItem | null> = await Promise.all(
          response.items.map(async (item: StorageReference) => {
            try {
              const url = await getDownloadURL(item);
              const metadata = await getMetadata(item);
              return {
                url,
                type: metadata.contentType || "",
              };
            } catch {
              return null;
            }
          })
        );

        setMediaUrls(items.filter((x): x is MediaItem => x !== null));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchMedia();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Upload Card */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
          padding: "20px",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
        }}
      >
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            if (!e.target.files) return;
            setFileUpload(e.target.files[0]);
          }}
          style={{ marginBottom: "20px", width: "100%" }}
        />

        <button
          onClick={uploadFile}
          disabled={!fileUpload}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #6366f1, #06b6d4)",
            color: "white",
            fontWeight: 600,
            cursor: fileUpload ? "pointer" : "not-allowed",
            opacity: fileUpload ? 1 : 0.6,
            width: "100%",
            maxWidth: "300px",
          }}
        >
          {uploadProgress > 0
            ? `Uploading ${Math.round(uploadProgress)}%`
            : "🚀 Upload"}
        </button>

        {uploadProgress > 0 && (
          <div style={{ marginTop: "15px" }}>
            <div
              style={{
                height: "8px",
                backgroundColor: "#334155",
                borderRadius: "5px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${uploadProgress}%`,
                  backgroundColor: "#22c55e",
                  borderRadius: "5px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Responsive Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "16px",
        }}
      >
        {mediaUrls.map((item, index) => (
          <div
            key={index}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              overflow: "hidden",
              borderRadius: "12px",
              backgroundColor: "#111",
              cursor: "pointer",
            }}
            onClick={() => setSelectedMedia(item)}
          >
            {item.type.startsWith("image") ? (
              <img
                src={item.url}
                alt="uploaded"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <video
                src={item.url}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selectedMedia && (
        <div
          onClick={() => setSelectedMedia(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "20px",
          }}
        >
          {selectedMedia.type.startsWith("image") ? (
            <img
              src={selectedMedia.url}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: "12px",
              }}
            />
          ) : (
            <video
              src={selectedMedia.url}
              controls
              autoPlay
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                borderRadius: "12px",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default MediaUpload;
