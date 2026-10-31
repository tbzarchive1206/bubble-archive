/** Keep source member IDs unchanged; only the visible mobile label is split. */
export function MemberName({ name }: { name: string }) {
  const label = name.toUpperCase();
  const match = label.match(/^(.*?)\s*(\([^)]*\))?$/);
  const member = match?.[1] || label;
  const years = match?.[2];
  return <><span className="member-name-full">{label}</span><span className="member-name-mobile">{member === "YOUNGHOON" ? <>YOUNG<br />HOON</> : member}{years && <span className="member-years">{years}</span>}</span></>;
}
