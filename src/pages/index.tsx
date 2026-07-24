import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>intoaec Lead Capture</h1>
      <p>Public lead capture forms (V1 &amp; V2).</p>
      <ul>
        <li>
          <code>/leadCapture</code> — org subdomain V1 form
        </li>
        <li>
          <code>/leadCapture/[projectSource]</code> — V1 with channel source
        </li>
        <li>
          <code>/leadCaptureV2/[leadCaptureV2Id]</code> — V2 public form
        </li>
      </ul>
      <p>
        <Link href="/leadCapture">Open /leadCapture</Link>
      </p>
    </div>
  );
};

export default Home;
