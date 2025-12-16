"use client";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@libnyanpasu/material-design-react";
import MaterialSymbolsCloseRounded from "~icons/material-symbols/close-rounded";
import Image from "next/image";
import { ComponentProps, PropsWithChildren, useMemo, useState } from "react";
import useSWR from "swr";

export const dynamic = "force-dynamic";

const getCodeTemplate = (url: string) => {
  return `const response = await fetch("${url}");
const data = await response.json();
console.log(data);`;
};

const SelectInner = ({
  children,
  placeholder,
  list,
  ...props
}: ComponentProps<typeof Select> & {
  placeholder: string;
  list?: string[];
}) => {
  return (
    <div className="flex items-center gap-2">
      <Select {...props}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder}>
            {props.value || children}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {list ? (
            list.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))
          ) : (
            <div className="mx-auto p-4">Loading</div>
          )}
        </SelectContent>
      </Select>

      {props.value && (
        <Button icon onClick={() => props.onValueChange?.("")}>
          <MaterialSymbolsCloseRounded className="size-6" />
        </Button>
      )}
    </div>
  );
};

const Character = (props: ComponentProps<typeof Select>) => {
  const characters = useSWR("/characters", async (url) => {
    const response = await fetch(url);
    return (await response.json()) as string[];
  });

  return (
    <SelectInner
      placeholder="Select Character"
      list={characters.data}
      {...props}
    />
  );
};

const CodeBox = ({ children }: PropsWithChildren) => {
  return (
    <code className="rounded-2xl border p-4 font-mono leading-6 break-all whitespace-pre-wrap">
      {children}
    </code>
  );
};

const ResposePreview = ({ type, data }: { type?: string; data?: unknown }) => {
  if (type === "json") {
    return <CodeBox>{JSON.stringify(data, null, 2)}</CodeBox>;
  }

  if (type === "base") {
    return (
      <CodeBox>
        {String(data).slice(0, 100) + (String(data).length > 100 ? "..." : "")}
      </CodeBox>
    );
  }

  if (data instanceof Blob) {
    return (
      <Image
        src={URL.createObjectURL(data as Blob)}
        width={1024}
        height={1024}
        alt="preview"
      />
    );
  }
};

export default function Page() {
  const [character, setCharacter] = useState<string>();

  const [responseType, setResponseType] = useState<string>();

  const responseUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const searchParams = new URLSearchParams();

    if (character) {
      searchParams.set("character", character);
    }

    if (responseType) {
      searchParams.set("method", responseType);
    }

    const params = searchParams.toString();

    return `${window.location.origin}${params ? "?" + params : ""}`;
  }, [character, responseType]);

  const { data, isValidating, mutate } = useSWR(
    "mock-request",
    async () => {
      const response = await fetch(responseUrl);

      if (responseType === "base") {
        return await response.text();
      }

      if (responseType === "json") {
        return await response.json();
      }

      return await response.blob();
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
    },
  );

  if (typeof window === "undefined") {
    return "";
  }

  return (
    <div className="h-dvh-subtract-16 grid place-content-center overflow-y-auto">
      <Card className="max-w-2xl">
        <CardHeader>Playground</CardHeader>

        <CardContent className="max-h-dvh-subtract-60 overflow-auto">
          <Character value={character} onValueChange={setCharacter}>
            {character}
          </Character>

          <div>Get Characters API</div>

          <CodeBox>
            {typeof window !== "undefined"
              ? `${window.location.origin}/characters`
              : "/characters"}
          </CodeBox>

          <SelectInner
            placeholder="Response Type"
            list={["json", "base"]}
            value={responseType}
            onValueChange={setResponseType}
          >
            {responseType}
          </SelectInner>

          <div>fetch API Example</div>

          <CodeBox>{getCodeTemplate(responseUrl)}</CodeBox>

          {Boolean(data) && <div>Response Preview</div>}

          <ResposePreview type={responseType} data={data} />
        </CardContent>

        <CardFooter>
          <Button
            loading={isValidating}
            onClick={() => {
              mutate();
            }}
          >
            Execute
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
