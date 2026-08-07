/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/config/env"
import axios, { isAxiosError } from "axios"

interface EmailAttachment {
  name: string
  contentType: string
  binaryContent: string
}

interface SendEmailProps {
  recipients: string[]
  cc?: string[]
  subject: string
  htmlContent: any
  attachments?: EmailAttachment[]
}

function requireMailConfig() {
  const apiKey = env.ELASTIC_MAIL_API_KEY
  const fromAddress = env.ELASTIC_MAIL_DOMAIN
  const apiUrl = env.ELASTIC_MAIL_API_URL
  if (!apiKey || !fromAddress || !apiUrl) {
    throw new Error("Elastic Email is not configured")
  }
  return { apiKey, fromAddress, apiUrl }
}

function buildRecipients(recipients: string[], cc?: string[]) {
  if (!cc?.length) {
    return { To: recipients }
  }
  return { To: recipients, CC: cc }
}

function buildAttachments(attachments?: EmailAttachment[]) {
  if (!attachments?.length) return undefined
  return attachments.map((attachment) => ({
    Name: attachment.name,
    ContentType: attachment.contentType,
    BinaryContent: attachment.binaryContent,
  }))
}

function buildEmailPayload({
  recipients,
  cc,
  subject,
  htmlContent,
  attachments,
  fromAddress,
}: SendEmailProps & { fromAddress: string }) {
  const attachmentPayload = buildAttachments(attachments)

  return {
    Recipients: buildRecipients(recipients, cc),
    Content: {
      From: fromAddress,
      Subject: subject,
      Body: [
        {
          ContentType: "HTML",
          Content: htmlContent,
          Charset: "utf-8",
        },
      ],
    },
    ...(attachmentPayload ? { Attachments: attachmentPayload } : {}),
  }
}

function buildEmailError(error: unknown) {
  if (isAxiosError(error) && error.response) {
    return {
      success: false as const,
      message: "Failed to send email.",
      error: error.response.data,
    }
  }

  return {
    success: false as const,
    message: "Failed to send email",
  }
}

export const sendEmail = async (props: SendEmailProps) => {
  try {
    const { apiKey, fromAddress, apiUrl } = requireMailConfig()
    const response = await axios.post(
      apiUrl,
      buildEmailPayload({ ...props, fromAddress }),
      {
        headers: {
          "Content-Type": "application/json",
          "X-ElasticEmail-ApiKey": apiKey,
        },
      }
    )

    if (![200, 202].includes(response.status)) {
      return {
        success: false as const,
        message: "Failed to send email. Status: " + response.status,
        error: response.data,
      }
    }

    return {
      success: true as const,
      message: "Email sent successfully.",
      data: response.data,
    }
  } catch (error) {
    return buildEmailError(error)
  }
}
