"use client";

import { useState } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import countryList from "react-select-country-list";

type CountryPickerProps = {
  name: string;
  label: string;
  control: Control<any>;
  error?: FieldError;
  required?: boolean;
};

function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  // country options with flags
  const countries = countryList().getData();

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return "🏳️";

    // convert country code to regional indicator symbols
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => {
        // regional indicator symbol letter A starts at 0x1F1E6 (127462)
        // A = 65, so we calculate: 127462 + (charCode - 65)
        return 127462 + char.charCodeAt(0) - 65;
      });

    try {
      return String.fromCodePoint(...codePoints);
    } catch {
      return "🏳️";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="country-select-trigger"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span className="leading-none">{getFlagEmoji(value)}</span>

              <span>{countries.find((c) => c.value === value)?.label}</span>
            </span>
          ) : (
            "Select your country..."
          )}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-full p-0 bg-gray-800 border-gray-600"
      >
        <Command className="bg-gray-800 border-gray-600">
          <CommandInput
            placeholder="Search countries..."
            className="country-select-input"
          />

          <CommandEmpty className="country-select-empty">
            No country found.
          </CommandEmpty>

          <CommandList className="max-h-60 bg-gray-800 scrollbar-hide-default">
            <CommandGroup className="bg-gray-800">
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.value}`}
                  onSelect={() => {
                    onChange(country.value);
                    setOpen(false);
                  }}
                  className="country-select-item"
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4 text-yellow-500",
                      value === country.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <span className="leading-none">
                      {getFlagEmoji(country.value)}
                    </span>

                    <span>{country.label}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const CountryPicker = ({
  name,
  label,
  control,
  error,
  required = false,
}: CountryPickerProps) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="form-label">
      {label}
    </Label>

    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? `Please select ${label.toLowerCase()}` : false,
      }}
      render={({ field }) => (
        <CountrySelect value={field.value} onChange={field.onChange} />
      )}
    />

    {error && <p className="text-sm text-red-500">{error.message}</p>}

    <p className="text-xs text-gray-500">
      Helps us show market data and news relevant to you.
    </p>
  </div>
);

export default CountryPicker;
