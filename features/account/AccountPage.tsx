"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useAction } from "next-safe-action/hooks"
import { useAtomValue, useSetAtom } from "jotai"
import { useRouter } from "nextjs-toploader/app"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TextFormField } from "@/components/forms/TextFormField"
import { stringFieldProps } from "@/lib/form-utils"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { userAuthAtom } from "@/features/auth/atom/User.auth.atom"
import {
  getAccountProfileAction,
  updateAccountProfileAction,
} from "@/features/auth/actions/account.action"
import { UserProfileUpdateSchema } from "@/features/users/schema/user.schema"
import { uploadFile } from "@/lib/storage/client.storage"
import { cn, isNotNull } from "@/lib/utils"
import { sileo } from "sileo"
import { ROUTES } from "@/constants/app.routes"
import { UserWithoutPassword } from "@/features/users/schema/user.schema"
import { IconCamera } from "@tabler/icons-react"

async function uploadPendingFile(
  pendingFile: File,
  uid: string
): Promise<string> {
  const ext = pendingFile.name.split(".").pop() ?? "jpg"
  return uploadFile(pendingFile, `users/${uid}/profile-${Date.now()}.${ext}`, {
    contentType: pendingFile.type,
  })
}

// fallow-ignore-next-line complexity
const AccountPage = () => {
  const router = useRouter()
  const user = useAtomValue(userAuthAtom)
  const setUserAuth = useSetAtom(userAuthAtom)
  const pendingFileRef = React.useRef<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { executeAsync: updateProfile, isExecuting: isUpdating } = useAction(
    updateAccountProfileAction,
    {
      // fallow-ignore-next-line complexity
      onSuccess: ({ data }) => {
        if (data?.success && "user" in data) {
          sileo.success({ title: data.message ?? "Profile updated" })
          setUserAuth(data.user)
          form.reset({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            phoneNumber: data.user.phoneNumber ?? "",
            photoURL: data.user.photoURL ?? null,
          })
          pendingFileRef.current = null
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return null
          })
        } else if (data && "success" in data && data.success === false) {
          sileo.error({ title: data.message })
        }
      },
      onError: ({ error }) => {
        sileo.error({ title: error.serverError ?? "Could not update profile" })
      },
    }
  )

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      photoURL: (user?.photoURL ?? null) as string | null,
    },
    validators: { onSubmit: UserProfileUpdateSchema },
    // fallow-ignore-next-line complexity
    onSubmit: async ({ value }) => {
      const uid = user?.id
      if (!isNotNull(uid)) {
        sileo.error({ title: "Not signed in" })
        router.replace(ROUTES.LOGIN)
        return
      }
      setIsUploading(true)
      try {
        const pendingFile = pendingFileRef.current
        const nextPhoto = pendingFile
          ? await uploadPendingFile(pendingFile, uid as string)
          : value.photoURL
        await updateProfile({
          firstName: value.firstName,
          lastName: value.lastName,
          phoneNumber: value.phoneNumber,
          photoURL: nextPhoto ?? null,
        })
      } catch (e) {
        sileo.error({ title: e instanceof Error ? e.message : "Upload failed" })
      } finally {
        setIsUploading(false)
      }
    },
  })

  const { executeAsync: fetchProfile, isExecuting: isFetchingProfile } =
    useAction(getAccountProfileAction, {
      // fallow-ignore-next-line complexity
      onSuccess: ({ data }) => {
        if (data?.success && "user" in data) {
          setUserAuth(data.user)
          form.reset({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            phoneNumber: data.user.phoneNumber ?? "",
            photoURL: data.user.photoURL ?? null,
          })
        } else if (data && "success" in data && data.success === false) {
          sileo.error({ title: data.message })
        }
      },
      onError: ({ error }) => {
        sileo.error({
          title: error.serverError ?? "Could not load profile",
        })
      },
    })

  const hasFetchedOnMount = React.useRef(false)
  useEffect(() => {
    if (hasFetchedOnMount.current) return
    hasFetchedOnMount.current = true
    void fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const displayUser = user as UserWithoutPassword | null
  const avatarSrc = previewUrl ?? displayUser?.photoURL ?? undefined

  const handleAvatarChange = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (!file) {
      pendingFileRef.current = null
      return
    }
    pendingFileRef.current = file
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleRemovePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    pendingFileRef.current = null
    form.setFieldValue("photoURL", null)
  }

  const loading =
    isFetchingProfile || isUpdating || isUploading || form.state.isSubmitting

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Update your profile details. Email and roles are managed by an
            administrator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={() => form.handleSubmit()}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="size-24 rounded-xl">
                <AvatarImage src={avatarSrc} alt="" />
                <AvatarFallback className="rounded-xl text-lg">
                  {displayUser?.firstName?.[0]}
                  {displayUser?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-2">
                <label
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "inline-flex cursor-pointer gap-1.5"
                  )}
                >
                  <IconCamera className="size-4" />
                  Change photo
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      handleAvatarChange(f ?? null)
                      e.target.value = ""
                    }}
                  />
                </label>
                {(displayUser?.photoURL || previewUrl) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                  >
                    Remove photo
                  </Button>
                )}
              </div>
            </div>

            <Field>
              <FieldLabel htmlFor="account-email">Email</FieldLabel>
              <FieldContent>
                <Input
                  id="account-email"
                  value={displayUser?.email ?? ""}
                  disabled
                  readOnly
                />
              </FieldContent>
            </Field>

            {displayUser?.roles && displayUser.roles.length > 0 ? (
              <Field>
                <FieldTitle>Roles</FieldTitle>
                <FieldContent className="flex flex-wrap gap-1.5">
                  {displayUser.roles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role.replaceAll("_", " ")}
                    </Badge>
                  ))}
                </FieldContent>
              </Field>
            ) : null}

            <form.Field name="firstName">
              {(field) => (
                <TextFormField
                  label="First name"
                  {...stringFieldProps(field)}
                />
              )}
            </form.Field>

            <form.Field name="lastName">
              {(field) => (
                <TextFormField label="Last name" {...stringFieldProps(field)} />
              )}
            </form.Field>

            <form.Field name="phoneNumber">
              {(field) => (
                <TextFormField
                  label="Phone"
                  type="tel"
                  {...stringFieldProps(field)}
                />
              )}
            </form.Field>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full sm:w-auto"
            >
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountPage
