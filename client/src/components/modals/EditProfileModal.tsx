import { FormEvent, useEffect, useState } from "react";
import { ApiClientError } from "../../api/client";
import { usersApi } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Field, PrimaryButton, SecondaryButton, TextArea } from "../ui/Form";
import { Modal } from "../ui/Modal";

export function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setBio(user.bio || "");
    setSkills(user.skills.join(", "));
  }, [user, isOpen]);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await usersApi.updateProfile(user.id, {
        bio,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setUser(updated);
      showToast("Profile updated!");
      onClose();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit}>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Field label="Bio">
          <TextArea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short introduction..." />
        </Field>
        <Field label="Skills">
          <TextArea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="comma, separated, skills" />
        </Field>
        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton type="button" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
