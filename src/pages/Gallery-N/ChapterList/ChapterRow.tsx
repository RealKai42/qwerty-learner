export default function ChapterRow({ index, checked, onChange }: { index: number; checked: boolean; onChange: (index: number) => void }) {
  return (
    <tr className="flex">
      <td className="px-6 py-4  w-15 flex justify-center items-center">
        <input
          type="radio"
          name="selectedChapter"
          checked={checked}
          onChange={() => {
            onChange(index)
          }}
          className="mt-0.5 border-gray-300 rounded-full text-indigo-600 outline-none focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0 "
        />
      </td>
      <td className="px-6 py-4 flex-1 text-sm text-gray-700 text-center">{index + 1}</td>
      <td className="px-6 py-4 flex-1 text-sm text-gray-700 text-center">{20}</td>
      <td className="px-6 py-4 flex-1 text-sm text-gray-700 text-center">80%</td>
    </tr>
  )
}
