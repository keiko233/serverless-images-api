import { z } from "zod";
import { formatError } from "@/utils/fmt";
import { fetchWithRetry } from "@/utils/retry";

interface MicrosoftAuthenticationResponse {
  token_type: string;
  expires_in: string;
  ext_expires_in: string;
  expires_on: string;
  not_before: string;
  resource: string;
  access_token: string;
  error_description?: string;
}

export interface OneDriveFile {
  id: string;
  name: string;
  size: number;
  lastModifiedDateTime: string;
  file?: {
    mimeType: string;
  };
  parentReference?: {
    id: string;
    path: string;
  };
  content?: {
    downloadUrl?: string;
  };
  '@microsoft.graph.downloadUrl'?: string; // 添加Microsoft Graph下载URL字段
}

export const OnedriveConfigSchema = z.object({
  clientID: z.string().nonempty(),
  clientSecret: z.string().nonempty(),
  tenantID: z.string().nonempty(),
  userEmail: z.string().email(),
});

export type OnedriveConfig = z.infer<typeof OnedriveConfigSchema>;

const HOST = {
  oauth: "https://login.microsoftonline.com",
  api: "https://graph.microsoft.com",
};

export class OnedriveService {
  private config: OnedriveConfig;
  private msAuth?: MicrosoftAuthenticationResponse;
  private tenantUrl: string;

  constructor(config: OnedriveConfig) {
    this.config = config;

    this.tenantUrl = `${HOST.api}/v1.0/users/${this.config.userEmail}/drive/root`;
  }

  public async auth() {
    const formData = new URLSearchParams();

    formData.append("grant_type", "client_credentials");
    formData.append("client_id", this.config.clientID);
    formData.append("client_secret", this.config.clientSecret);
    formData.append("resource", `${HOST.api}/`);
    formData.append("scope", `${HOST.api}/.default`);

    try {
      const res = await fetchWithRetry(
        `${HOST.oauth}/${this.config.tenantID}/oauth2/token`,
        {
          method: "POST",
          body: formData.toString(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      this.msAuth = (await res.json()) as MicrosoftAuthenticationResponse;

      if (!this.msAuth.access_token) {
        throw new Error("Access token is empty");
      }

      return this;
    } catch (err) {
      throw new Error(formatError(err) || "Error fetching access token");
    }
  }

  public async getFile(path: string): Promise<OneDriveFile> {
    try {
      if (!this.msAuth) {
        await this.auth();
      }

      const url = `${this.tenantUrl}:${encodeURIComponent(path)}`;

      const response = await fetchWithRetry(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.msAuth?.access_token}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        console.error(message);
        throw new Error(`Failed to get file: ${message}`);
      }

      return await response.json();
    } catch (err) {
      throw new Error(formatError(err) || "Error getting file");
    }
  }
  public async getLink(filePath: string, customHost?: string): Promise<string> {
    try {
      const fileInfo = await this.getFile(filePath);
      
      // 检查是否是文件
      if (!fileInfo.file) {
        throw new Error("Not a file");
      }
      
      // 获取下载URL
      let downloadUrl = fileInfo['@microsoft.graph.downloadUrl'] || fileInfo.content?.downloadUrl;
      
      if (!downloadUrl) {
        throw new Error("Download URL not found");
      }
      
      // 如果提供了自定义主机，则替换URL中的主机名
      if (customHost) {
        try {
          const urlObj = new URL(downloadUrl);
          urlObj.host = customHost;
          downloadUrl = urlObj.toString();
        } catch (error) {
          console.error("Failed to parse download URL:", error);
        }
      }
      
      return downloadUrl;
    } catch (err) {
      throw new Error(formatError(err) || "Error getting download link");
    }
  }

  public async upload(fileBuffer: Buffer, uploadPath: string) {
    try {
      if (!this.msAuth) {
        await this.auth();
      }

      const url = `${this.tenantUrl}:${encodeURIComponent(uploadPath)}:/content`;

      const response = await fetchWithRetry(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.msAuth?.access_token}`,
          "Content-Type": "application/octet-stream",
        },
        body: fileBuffer,
      });

      if (!response.ok) {
        const message = await response.text();
        console.error(message);
        throw new Error("Failed to upload file: " + message);
      }

      return response.json();
    } catch (err) {
      throw new Error(formatError(err));
    }
  }
}
