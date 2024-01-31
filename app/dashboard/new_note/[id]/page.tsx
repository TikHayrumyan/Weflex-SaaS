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
import { revalidatePath,unstable_noStore as NoStore  } from "next/cache";

export async function getData({
  userId,
  noteId,
}: {
  userId: string;
  noteId: string;
}) {
  NoStore()

  const data = await prisma.note.findUnique({
    where: {
      id: noteId,
      userId: userId,
    },
    select: {
      title: true,
      description: true,
      id: true,
    },
  });

  return data;
}

export default async function DynamicNote({
  params,
}: {
  params: { id: string };
}) {
  NoStore()

  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData({ userId: user?.id as string, noteId: params.id });

  async function PostData(formData: FormData) {
    "use server";

    if (!user) {
      throw new Error("not authorized");
    }
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    await prisma.note.update({
      where: {
        id: data?.id,
        userId: user?.id,
      },
      data: {
        userId: user?.id,
        title: title,
        description: description,
      },
    });

    revalidatePath("/dashboard");
    return redirect("/dashboard");
  }

  return (
    <Card>
      <form action={PostData}>
        <CardHeader>
          <CardTitle>Edit Note</CardTitle>
          <CardDescription>
            Right here you can now edit your notes
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
              defaultValue={data?.title}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <label>Description</label>
            <Textarea
              required
              name="description"
              placeholder="Describe your note as you want"
              defaultValue={data?.description}
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
