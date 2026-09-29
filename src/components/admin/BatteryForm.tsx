import { HOURS_RANGE, type Settings } from "@/lib/protocol";

const hoursInput = "w-20 border-2 border-edge bg-screen px-1 text-lg outline-none caret-pink focus:border-pink";

type Props = {
  draft: Settings; // what the boxes show: your edit, or the saved settings
  dirty: boolean; // true once you've changed something
  busy: boolean;
  onChange: (settings: Settings) => void;
  onSave: () => void;
};

/** How many hours a full charge and a full mood last. Saving switches every open page's speed. */
export function BatteryForm({ draft, dirty, busy, onChange, onSave }: Props) {
  return (
    <>
      <form
        className="flex flex-wrap items-center gap-x-5 gap-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <label className="flex items-center gap-2">
          charge lasts
          <input
            type="number"
            min={HOURS_RANGE[0]}
            max={HOURS_RANGE[1]}
            step={0.5}
            value={draft.chargeHours}
            onChange={(e) => onChange({ ...draft, chargeHours: Number(e.target.value) })}
            className={hoursInput}
          />
          h
        </label>
        <label className="flex items-center gap-2">
          mood lasts
          <input
            type="number"
            min={HOURS_RANGE[0]}
            max={HOURS_RANGE[1]}
            step={0.5}
            value={draft.moodHours}
            onChange={(e) => onChange({ ...draft, moodHours: Number(e.target.value) })}
            className={hoursInput}
          />
          h
        </label>
        <button className="btn" disabled={busy || !dirty}>
          save
        </button>
      </form>
      <p className="mt-2 text-dim">
        How long a full bar lasts on a normal day ({HOURS_RANGE[0]} to {HOURS_RANGE[1]} h). Night makes it last twice as
        long; heat and rain shorten it.
      </p>
    </>
  );
}
