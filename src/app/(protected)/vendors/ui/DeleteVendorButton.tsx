"use client";

import { Button } from "@/shared/ui/buttons/button";
import { Text } from "@/shared/ui/data-display/text";
import { Alert } from "@/shared/ui/feedback/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/overlay/dialog";
import { Trash2 } from "lucide-react";
import { useDeleteVendorModel } from "./DeleteVendorButton.model";

interface DeleteVendorButtonProps {
  vendorId: string;
  vendorName: string;
}

export function DeleteVendorButton({ vendorId, vendorName }: DeleteVendorButtonProps) {
  const {
    isOpen,
    isDeleting,
    error,
    handleClose,
    handleDelete,
    setIsOpen,
  } = useDeleteVendorModel({ vendorId });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="icon-sm" variant="ghost" aria-label="Delete vendor">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Vendor</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <Text as="span" weight="semibold">{vendorName}</Text>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && <Alert variant="error">{error}</Alert>}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
