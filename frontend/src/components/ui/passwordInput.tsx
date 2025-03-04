'use client'
import { ChangeEventHandler, useState } from "react";
import { Input } from "./input";
import { EyeIcon, EyeClosedIcon } from "lucide-react";

const PasswordInput = ({ value, onChange, className }: { value: string, onChange: ChangeEventHandler<HTMLInputElement>, className: string }) => {
  const [isView, setIsView] = useState<boolean>(false);
  return (
    <div className={`${className} flex w-full max-w-sm items-center relative col-span-3`}>
      <Input
        type={isView ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`pr-10 flex-1`}
      />
      {isView ? (
        <EyeClosedIcon
          className="h-6 w-6 cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => setIsView(!isView)}
        />
      ) : (
        <EyeIcon
          className="h-6 w-6 cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => setIsView(!isView)}
        />
      )}
    </div>
  )
};

export default PasswordInput