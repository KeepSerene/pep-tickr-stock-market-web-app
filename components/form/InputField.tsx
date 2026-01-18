import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

function InputField({
  type = "text",
  name,
  label,
  value,
  disabled,
  placeholder,
  register,
  validation = {},
  error,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>

      <Input
        type={type}
        id={name}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        className={cn("form-input", {
          "opacity-50 cursor-not-allowed": disabled,
          "border-red-500 focus:border-red-500": error,
        })}
        {...register(name, validation)}
      />

      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
}

export default InputField;
