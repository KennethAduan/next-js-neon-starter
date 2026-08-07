import { Metadata } from "next";
import UnlockRegisterAdminForm from "./_components/UnlockRegisterAdminForm";
export const metadata: Metadata = {
  title: "Register Admin",
  description: "Register Admin",
};

const page = () => {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UnlockRegisterAdminForm />
      </div>
    </div>
  );
};

export default page;
