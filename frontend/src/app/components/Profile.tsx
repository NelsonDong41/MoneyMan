'use client'

import { useAuth } from "../Providers"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PasswordField from "@/components/ui/passwordInput"
import { useState } from "react"
import { toast } from "sonner"

export default function Profile() {
  const { accessToken, signIn, signOut, isLoading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  const handleSignIn = async () => {
    signIn(email, password).then(() => {
      toast.success(`Sign In Success`)
    }).catch(error => {
      toast.error(`${error}`, {
        description: "Keep in mind this is for personal use for Nelson",
      })
    });
    setDialogOpen(false);
    setEmail("")
    setPassword("");
  }

  const handleSignOut = async () => {
    signOut().then(() => {
      toast.success(`Sign Out Success`)
    }).catch(error => {
      toast.error(`${error}`, {
        description: "Keep in mind this is for personal use for Nelson",
      })
    });
    setDialogOpen(false);
    setEmail("")
    setPassword("");
  }

  if (isLoading) {
    return < div > LOADING</ div>
  }

  if (accessToken) {
    return <Button variant='destructive' onClick={handleSignOut}>Sign Out</Button>
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setDialogOpen(true)}>Sign In</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Notice! - This was created primarily for Nelson Dong, currently no plans to add any additional users
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSignIn}>Sign In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}