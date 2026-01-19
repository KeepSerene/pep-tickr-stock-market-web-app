"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { EyeIcon, EyeClosedIcon } from "lucide-react";

function PasswordInput({
  name,
  label,
  disabled,
  placeholder,
  register,
  validation = {},
  error,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>

      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          id={name}
          disabled={disabled}
          placeholder={placeholder}
          className={cn("form-input pr-12", {
            "opacity-50 cursor-not-allowed": disabled,
            "border-red-500 focus:border-red-500": error,
          })}
          {...register(name, validation)}
        />

        <Toggle
          pressed={showPassword}
          onPressedChange={setShowPassword}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          title={showPassword ? "Hide password" : "Show password"}
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 size-8 p-0",
            "bg-transparent hover:bg-gray-700 data-[state=on]:bg-gray-700",
            "border-0 rounded",
            {
              "opacity-50 cursor-not-allowed": disabled,
            },
          )}
        >
          {showPassword ? (
            <EyeClosedIcon className="size-4 text-gray-400" />
          ) : (
            <EyeIcon className="size-4 text-gray-400" />
          )}
        </Toggle>
      </div>

      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
}

export default PasswordInput;
