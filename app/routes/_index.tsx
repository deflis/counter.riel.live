import type { MetaFunction } from "@remix-run/node";
import { useCallback, useState } from "react";
import iconv from "iconv-lite";

export const meta: MetaFunction = () => {
  return [
    { title: "テキストカウンター" },
    { name: "description", content: "テキストの文字数を数えます" },
  ];
};

export default function Index() {
  const [value, setValue] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    []
  );

  return (
    <div className="flex flex-row w-full h-dvh">
      <div className="w-2/3 m-4 p-4 rounded-xl bg-slate-300">
        <div className="h-8 text-slate-800">
          <label htmlFor="text">カウントしたいテキスト：</label>
        </div>
        <textarea
          id="text"
          name="text"
          className="w-full h-[calc(100%-2rem)] bg-white text-black"
          placeholder="ここにテキストを入力..."
          value={value}
          onChange={handleChange}
        ></textarea>
      </div>
      <div className="w-1/3 m-4 p-4 rounded-xl bg-slate-300 text-200">
        <div className="space-y-2">
          <LabeledText label="文字数">
            {Array.from(value).length}文字
          </LabeledText>
          <LabeledText label="文字数（空白を除く）">
            {Array.from(value.replace(/\s/g, "")).length}文字
          </LabeledText>
          <LabeledText label="全角文字数（半角文字を0.5文字でカウントする）">
            {Array.from(value).reduce((acc, char) => {
              // eslint-disable-next-line no-control-regex
              return acc + (char.match(/[^\x01-\x7E]/) ? 1 : 0.5);
            }, 0)}
            文字
          </LabeledText>
          <LabeledText label="行数">{value.split("\n").length}行</LabeledText>
          <LabeledText label="バイト数（UTF-8）">
            {encodeCount(value, "UTF-8")}バイト
          </LabeledText>
          <LabeledText label="バイト数（Shift_JIS）">
            {encodeCount(value, "Shift_JIS")}バイト
          </LabeledText>
        </div>
      </div>
    </div>
  );
}

const LabeledText: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => {
  return (
    <dl>
      <dt className="rounded-xl rounded-b-none bg-slate-200 ps-2">{label}</dt>
      <dd className="rounded-xl rounded-t-none bg-slate-100 ps-2">
        {children}
      </dd>
    </dl>
  );
};

type Encoding = "UTF-8" | "Shift_JIS";

function encodeCount(value: string, encoding: Encoding): number {
  return iconv.encode(value, encoding).length;
}
