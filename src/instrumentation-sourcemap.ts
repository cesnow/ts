import {v4 as uuidV4} from 'uuid';
import FormData from 'form-data';
import axios from "axios";
import * as fs from "fs";
import * as path from "path";

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT;

async function checkReleaseVersion(version: string) {
  const url = `https://sentry.io/api/0/organizations/${SENTRY_ORG}/releases/`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`
      }
    });

    const releaseExists = response.data.some((release: any) => release.version === version);
    if (releaseExists) {
      console.log(`Release version ${version} already exists.`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking release version:", error.data);
    throw error;
  }
}

// 创建 Release
async function createRelease(version: string) {
  const url = `https://sentry.io/api/0/organizations/${SENTRY_ORG}/releases/`;
  try {
    const response = await axios.post(url, {
      version,
      projects: [SENTRY_PROJECT]
    }, {
      headers: {
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    console.log("Release created: ", response.data.id);
  } catch (error) {
    console.error("Error creating release:", error.data);
    throw error;
  }
}

// 上传 Source Maps
async function uploadSourceMap(version: string, filePath: string, fileName: string) {
  const url = `https://sentry.io/api/0/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/releases/${version}/files/`;
  try {
    const debugId = uuidV4();
    const formData = new FormData();
    formData.append("name", fileName);
    formData.append("file", fs.readFileSync(filePath), fileName);
    formData.append('header', 'Sourcemap Reference');
    formData.append('debug_id', debugId);

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
        'Content-Type': 'multipart/form-data',
      }
    });
    console.log(`Source map uploaded: [${response.data.id}/${response.data.size}kb] ${fileName}`);
  } catch (error) {
    console.error(`Error uploading source map (${fileName}):`, error.data);
  }
}

const ignorePatterns: RegExp[] = [
  /framework-\*/,
  /framework\.\*/,
  /main-\*/,
  /polyfills-\*/,
  /webpack-\*/
];

async function traverseAndUpload(sourceMapPath: string, version: string) {
  const filesAndDirs = fs.readdirSync(sourceMapPath);

  for (const fileOrDir of filesAndDirs) {
    const filePath = path.join(sourceMapPath, fileOrDir);

    if (fs.statSync(filePath).isDirectory()) {
      await traverseAndUpload(filePath, version);
      continue;
    }

    const shouldIgnore = ignorePatterns.some(pattern => pattern.test(fileOrDir));
    if (shouldIgnore) {
      console.log(`Ignoring file: ${fileOrDir}`);
      continue;
    }

    // map first and js
    if (fileOrDir.endsWith(".map") || fileOrDir.endsWith(".js")) {
      const fileName = `~/${path.relative('/app/.next/static/chunks', filePath)}`;
      await uploadSourceMap(version, filePath, fileName);
    }
  }
}

export async function updateSentryRelease() {

  const localVersion = fs.readFileSync("/app/.next/BUILD_ID", "utf8").trim();
  console.log("Local build version: ", localVersion);

  const releaseExists = await checkReleaseVersion(localVersion);
  if (releaseExists) {
    console.log(`Skipping release creation and source map upload for version ${localVersion}.`);
    return;
  }

  try {
    await createRelease(localVersion);
    await traverseAndUpload("/app/.next/static/chunks", localVersion);

    console.log("Source maps uploaded successfully.");
  } catch (error) {
    console.error("Failed to upload source maps:", error);
  }
}
