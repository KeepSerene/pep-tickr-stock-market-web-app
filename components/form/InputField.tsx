import { Label } from "../ui/label";

function InputField({
  type = "text",
  name,
  label,
  value,
  disabled,
  placeholder,
  register,
  validation,
  error,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label>Label</Label>
    </div>
  );
}

export default InputField;
