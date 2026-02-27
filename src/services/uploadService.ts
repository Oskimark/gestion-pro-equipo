import { supabase } from "@/lib/supabase";

export const uploadService = {
    /**
     * Uploads a file to a specific bucket
     * @param file The file object from input
     * @param bucket Bucket name (e.g., 'player-photos')
     * @returns The public URL of the uploaded image
     */
    async uploadFile(file: File, bucket: string = "player-photos"): Promise<string> {
        try {
            // 1. Generate a unique file name
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // 2. Upload the file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 3. Get the public URL
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error) {
            console.error("Error in uploadService:", error);
            throw error;
        }
    },

    /**
     * Deletes a file from storage if it belongs to our bucket
     * @param url The public URL of the file
     * @param bucket Bucket name
     */
    async deleteFile(url: string, bucket: string = "player-photos"): Promise<void> {
        try {
            if (!url || !url.includes(bucket)) return;

            // Extract the filename from the URL
            const parts = url.split("/");
            const fileName = parts[parts.length - 1];

            const { error } = await supabase.storage
                .from(bucket)
                .remove([fileName]);

            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    }
};
