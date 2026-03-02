import { Link } from "react-router-dom";
import MediaUpload from "../components/MediaUpload";

export default function MediaPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        padding: "20px",
        boxSizing: "border-box",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "#60a5fa",
            fontWeight: 500,
            display: "inline-block",
            marginBottom: "20px",
          }}
        >
          ← Back to Dashboard
        </Link>

        <MediaUpload />
      </div>
    </div>
  );
}
