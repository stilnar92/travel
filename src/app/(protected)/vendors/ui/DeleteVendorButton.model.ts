"use client";

import { useState } from "react";
import { deleteVendorAction } from "../actions";

interface UseDeleteVendorModelOptions {
  vendorId: string;
}

export function useDeleteVendorModel({ vendorId }: UseDeleteVendorModelOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    const result = await deleteVendorAction(vendorId);

    if (result.success) {
      setIsOpen(false);
    } else {
      setError(result.error);
    }

    setIsDeleting(false);
  };

  return {
    isOpen,
    isDeleting,
    error,
    handleOpen,
    handleClose,
    handleDelete,
    setIsOpen,
  };
}
