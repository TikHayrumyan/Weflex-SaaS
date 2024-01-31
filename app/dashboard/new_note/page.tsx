import { SubmitButton } from "@/app/components/submit_button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import prisma from "@/app/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { unstable_noStore as NoStore } from "next/cache";

async function NewNoteRoute() {
  NoStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  async function PostData(formData: FormData) {
    "use server";
    if (!user) {
      throw new Error("not authorized");
    }
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    await prisma.note.create({
      data: {
        userId: user?.id,
        title: title,
        description: description,
      },
    });

    return redirect("/dashboard");
  }

  return (
    <Card>
      <form action={PostData}>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
          <CardDescription>
            Right here you can now create new notes
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-5">
          <div className="flex flex-col gap-y-2">
            <label>Title</label>
            <Input
              required
              type="text"
              name="title"
              placeholder="title for your note"
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <label>Description</label>
            <Textarea
              required
              name="description"
              placeholder="Describe your note as you want   "
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="destructive" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}

export default NewNoteRoute;
