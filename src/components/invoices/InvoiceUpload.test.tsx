import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { setViewportWidth } from "@/test/setup";

const uploadMutate = vi.fn().mockResolvedValue({});
const deleteMutate = vi.fn().mockResolvedValue({});

vi.mock("@/hooks/useInvoices", () => ({
  useInvoices: () => ({
    data: [
      {
        id: "i1",
        tripId: "trip-1",
        fileName: "facture.pdf",
        filePath: "u/facture.pdf",
        fileSize: 2048,
        mimeType: "application/pdf",
        createdAt: new Date().toISOString(),
        url: "https://example.com/facture.pdf",
      },
    ],
    isLoading: false,
  }),
  useUploadInvoice: () => ({ mutateAsync: uploadMutate }),
  useDeleteInvoice: () => ({ mutateAsync: deleteMutate }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { InvoiceUpload } from "./InvoiceUpload";
import { toast } from "sonner";

describe("InvoiceUpload across breakpoints", () => {
  beforeEach(() => {
    setViewportWidth(1440);
    uploadMutate.mockClear();
    deleteMutate.mockClear();
    (toast.error as any).mockClear();
  });

  it.each([390, 768, 1440])("renders existing invoice + upload controls at %ipx", (w) => {
    setViewportWidth(w);
    render(<InvoiceUpload tripId="trip-1" />);
    expect(screen.getByText("facture.pdf")).toBeInTheDocument();
    // The two file inputs (file + camera) should both exist for scan support.
    const inputs = document.querySelectorAll('input[type="file"]');
    expect(inputs.length).toBe(2);
    const cameraInput = Array.from(inputs).find((i) => i.hasAttribute("capture"));
    expect(cameraInput).toBeTruthy();
  });

  it("uploads a valid PDF file", async () => {
    render(<InvoiceUpload tripId="trip-1" />);
    const input = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement;
    const file = new File(["pdf"], "new.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(uploadMutate).toHaveBeenCalledTimes(1));
    expect(uploadMutate).toHaveBeenCalledWith({ tripId: "trip-1", file });
  });

  it("rejects unsupported mime types", async () => {
    render(<InvoiceUpload tripId="trip-1" />);
    const input = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement;
    const bad = new File(["x"], "bad.txt", { type: "text/plain" });
    fireEvent.change(input, { target: { files: [bad] } });
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(uploadMutate).not.toHaveBeenCalled();
  });
});
