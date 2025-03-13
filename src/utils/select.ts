export function selectFile(
  options: {
    multiple?: boolean;
    accept?: string;
  } = {},
): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";

    // Hide the input element
    input.style.display = "none";
    document.body.appendChild(input);

    // Configure multiple selection and accepted file types
    if (options.multiple) {
      input.multiple = true;
    }
    if (options.accept) {
      input.accept = options.accept;
    }

    // Listen for file selection changes
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      resolve(target.files);
      // Remove the input after selection
      document.body.removeChild(input);
    });

    // Handle cancellation
    input.addEventListener("cancel", () => {
      resolve(null);
      document.body.removeChild(input);
    });

    // Simulate click to trigger file selection dialog
    input.click();
  });
}
