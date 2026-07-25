import { updateProfileSchema } from "@/features/profile/validation";
import { profileRepository } from "./profile.repository";

export const profileService = {
  update(userId: string, input: unknown) {
    const data = updateProfileSchema.parse(input);
    return profileRepository.updateUser(userId, data);
  },
};
