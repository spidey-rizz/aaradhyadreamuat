export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);

  // Try navigator.clipboard first
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch((err) => {
        console.warn("navigator.clipboard.writeText failed, trying fallback: ", err);
        return fallbackCopyToClipboard(text);
      });
  }

  // Fallback method
  return Promise.resolve(fallbackCopyToClipboard(text));
}

function fallbackCopyToClipboard(text: string): boolean {
  if (typeof document === "undefined") return false;

  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Make the textarea invisible and prevent layout shifting/scrolling
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch (err) {
    console.error("Fallback copy to clipboard failed: ", err);
  }

  document.body.removeChild(textArea);
  return success;
}
