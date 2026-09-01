// ABOUTME: The portal — a hidden, self-contained page reachable only via the
// ABOUTME: pink spiral on the main page. That same spiral (top right) leads back out.
import Image from "next/image";
import Spiral from "@/components/Spiral";

export const metadata = {
  title: "the portal",
};

export default function Portal() {
  return (
    <div className="portal-page">
      <Image
        src="/images/void.jpeg"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover" }}
      />
      <h1 className="portal-message stamp">puzzle hunt: return on the solstice</h1>
      <Spiral href="/" size={48} className="portal-spiral-back" ariaLabel="Leave the portal" />
      <div className="portal-avatar-frame">
        <Image src="/images/avatar.png" alt="Beck's avatar" fill sizes="220px" style={{ objectFit: "cover" }} />
      </div>
    </div>
  );
}
