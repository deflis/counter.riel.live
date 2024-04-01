import type { MetaFunction } from "@remix-run/node";
import { useCallback, useMemo, useState } from "react";
import iconv from "iconv-lite";
import clsx from "clsx";

export const meta: MetaFunction = () => {
  return [
    { title: "テキストカウンター" },
    { name: "description", content: "テキストの文字数を数えます" },
  ];
};

export default function Index() {
  const [value, setValue] = useState("");
  const [monoFont, setMonoFont] = useState(false);
  const [lineSizeString, setLineSizeString] = useState("80");
  const lineSize = useMemo(
    () => parseInt(lineSizeString, 10),
    [lineSizeString]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    []
  );

  const handleCheckMonoFont = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMonoFont(e.target.checked);
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
          className={clsx([
            "w-full h-[calc(100%-2rem)] bg-white text-black",
            monoFont ? "font-mono" : "font-sans",
          ])}
          placeholder="ここにテキストを入力..."
          value={value}
          onChange={handleChange}
        ></textarea>
      </div>
      <div className="w-1/3 m-4 p-4 rounded-xl bg-slate-300 text-200">
        <div className="space-y-2">
          <LabeledText label="文字数">{countGrapheme(value)}文字</LabeledText>
          <LabeledText label="文字数（空白を除く）">
            {countGrapheme(value.replace(/\s/g, ""))}文字
          </LabeledText>
          <LabeledText label="全角文字数（半角文字を0.5文字でカウントする）">
            {Array.from(value).reduce((acc, char) => {
              // eslint-disable-next-line no-control-regex
              return acc + (char.match(/[^\x01-\x7E]/) ? 1 : 0.5);
            }, 0)}
            文字
          </LabeledText>
          <LabeledText label="行数">{value.split("\n").length}行</LabeledText>
          <div>
            <label htmlFor="lineSize">1行の文字数：</label>
            <input
              type="number"
              value={lineSizeString}
              onChange={(e) => setLineSizeString(e.target.value)}
            />
          </div>
          <LabeledText label="行数（1行の文字数で計算）">
            {countLineCountByLineSize(value, lineSize)}行
          </LabeledText>
          <LabeledText label="バイト数（UTF-8）">
            {encodeCount(value, "UTF-8")}バイト
          </LabeledText>
          <LabeledText label="バイト数（Shift_JIS）">
            {encodeCount(value, "Shift_JIS")}バイト
          </LabeledText>
          <div>
            <input
              checked={monoFont}
              type="checkbox"
              onChange={handleCheckMonoFont}
              id="monoFont"
            />
            <label htmlFor="monoFont">等幅フォントで表示する</label>
          </div>
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

const segmenter = Intl.Segmenter
  ? new Intl.Segmenter("ja", { granularity: "grapheme" })
  : null;
function countGrapheme(value: string) {
  if (!segmenter) {
    return Array.from(value).length;
  }
  return Array.from(segmenter.segment(value)).length;
}

function countLineCountByLineSize(value: string, lineSize: number) {
  return value.split("\n").reduce((acc, line) => {
    return acc + Math.ceil(countGrapheme(line) / lineSize);
  }, 0);
}

type Encoding = "UTF-8" | "Shift_JIS";

function encodeCount(value: string, encoding: Encoding): number {
  return iconv.encode(value, encoding).length;
}
