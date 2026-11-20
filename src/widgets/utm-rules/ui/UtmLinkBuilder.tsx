import {Copy} from "@gravity-ui/icons";
import {Button, Description, FieldError, Input, Label, TextField} from "@heroui/react";
import {useState} from "react";

import {copyText} from "@/shared/lib/clipboard";

const params = ["utm_source", "utm_medium", "utm_campaign"] as const;

/** Собирает ссылку с UTM-метками. Принимает только http(s)-адреса. */
function buildLink(base: string, values: Record<string, string>) {
  try {
    const url = new URL(base.trim());

    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    for (const [key, value] of Object.entries(values)) {
      if (value.trim()) url.searchParams.set(key, value.trim());
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function UtmLinkBuilder() {
  const [base, setBase] = useState("https://okna.example.kz/");
  const [values, setValues] = useState<Record<string, string>>({utm_source: "", utm_medium: "", utm_campaign: ""});

  const link = buildLink(base, values);

  const copy = () => link && copyText(link, "Ссылка скопирована");

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <TextField fullWidth isInvalid={!link} value={base} onChange={setBase}>
        <Label>Адрес страницы</Label>
        <Input placeholder="https://" variant="secondary" />
        <FieldError>Введите адрес, начинающийся с http:// или https://</FieldError>
      </TextField>
      <div className="grid gap-4 sm:grid-cols-3">
        {params.map((param) => (
          <TextField
            key={param}
            maxLength={100}
            value={values[param]}
            onChange={(value) => setValues((prev) => ({...prev, [param]: value}))}
          >
            <Label className="font-mono">{param}</Label>
            <Input variant="secondary" />
          </TextField>
        ))}
      </div>
      <TextField isReadOnly fullWidth value={link ?? ""}>
        <Label>Готовая ссылка</Label>
        <Input className="font-mono text-sm" variant="secondary" />
        <Description>Используйте её в рекламе — заявки с неё получат источник по правилам</Description>
      </TextField>
      <div>
        <Button isDisabled={!link} variant="secondary" onPress={copy}>
          <Copy className="size-4" />
          Скопировать
        </Button>
      </div>
    </div>
  );
}
