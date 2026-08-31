import { useMemo, useState } from "react";

/*
|--------------------------------------------------------------------------
| Nepal Land Measurement
|--------------------------------------------------------------------------
|
| 1 Ropani = 16 Aana
| 1 Aana   = 4 Paisa
| 1 Paisa  = 4 Daam
|
| Therefore:
|
| 1 Ropani = 256 Daam
|
| Square feet:
|
| 1 Ropani = 5476 sq.ft
| 1 Aana   = 342.25 sq.ft
| 1 Paisa  = 85.5625 sq.ft
| 1 Daam    = 21.390625 sq.ft
|
*/

const DAAM_PER_ROPANI = 256;
const DAAM_PER_AANA = 16;
const DAAM_PER_PAISA = 4;

const SQFT_PER_ROPANI = 5476;
const SQFT_PER_DAAM = SQFT_PER_ROPANI / DAAM_PER_ROPANI;

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface LandArea {
    ropani: number;
    aana: number;
    paisa: number;
    daam: number;
}

interface Calculations {
    totalDaam: number;
    wasteDaam: number;
    usefulDaam: number;

    totalArea: LandArea;
    wasteArea: LandArea;
    usefulArea: LandArea;

    totalSqft: number;
    wasteSqft: number;
    usefulSqft: number;

    pricePerAana: number;
    landValue: number;

    thaileRate: number;
    thaileAmount: number;

    gainTaxRate: number;
    gainTaxAmount: number;

    registrationRate: number;
    registrationAmount: number;

    totalCharges: number;
    grandTotal: number;
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function safeNumber(value: string): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return 0;
    }

    return Math.max(0, parsed);
}

function formatNumber(value: number, decimals = 2): string {
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

function formatCurrency(value: number): string {
    return "Rs. " + formatNumber(value, 2);
}

/*
|--------------------------------------------------------------------------
| Ropani / Aana / Paisa / Daam → Daam
|--------------------------------------------------------------------------
*/

function rapdToDaam(area: LandArea): number {
    return (
        area.ropani * DAAM_PER_ROPANI +
        area.aana * DAAM_PER_AANA +
        area.paisa * DAAM_PER_PAISA +
        area.daam
    );
}

/*
|--------------------------------------------------------------------------
| Daam → Ropani / Aana / Paisa / Daam
|--------------------------------------------------------------------------
*/

function daamToRAPD(totalDaam: number): LandArea {
    let remaining = Math.max(0, totalDaam);

    const ropani = Math.floor(remaining / DAAM_PER_ROPANI);

    remaining -= ropani * DAAM_PER_ROPANI;

    const aana = Math.floor(remaining / DAAM_PER_AANA);

    remaining -= aana * DAAM_PER_AANA;

    const paisa = Math.floor(remaining / DAAM_PER_PAISA);

    remaining -= paisa * DAAM_PER_PAISA;

    const daam = Math.round(remaining);

    return {
        ropani,
        aana,
        paisa,
        daam,
    };
}

/*
|--------------------------------------------------------------------------
| Daam → Square Feet
|--------------------------------------------------------------------------
*/

function daamToSqft(daam: number): number {
    return daam * SQFT_PER_DAAM;
}

/*
|--------------------------------------------------------------------------
| Reusable Number Input
|--------------------------------------------------------------------------
*/

interface AreaInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

function AreaInput({ label, value, onChange }: AreaInputProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>

            <input
                type="number"
                min="0"
                step="1"
                value={value}
                onChange={(event) => {
                    onChange(event.target.value);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-center text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
        </div>
    );
}

interface MoneyInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    suffix?: string;
    placeholder?: string;
}

function MoneyInput({
    label,
    value,
    onChange,
    suffix,
    placeholder,
}: MoneyInputProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>

            <div className="relative">
                <input
                    type="number"
                    min="0"
                    step="any"
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) => {
                        onChange(event.target.value);
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-20 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />

                {suffix && (
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-xs text-gray-500">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Section Header
|--------------------------------------------------------------------------
*/

interface SectionHeaderProps {
    number: number;
    title: string;
    description: string;
}

function SectionHeader({ number, title, description }: SectionHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    {number}
                </span>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h2>
            </div>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {description}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| RAPD Input Group
|--------------------------------------------------------------------------
*/

interface RAPDInputGroupProps {
    values: LandArea;
    onChange: (field: keyof LandArea, value: string) => void;
}

function RAPDInputGroup({ values, onChange }: RAPDInputGroupProps) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <AreaInput
                label="Ropani"
                value={String(values.ropani)}
                onChange={(value) => onChange("ropani", value)}
            />

            <AreaInput
                label="Aana"
                value={String(values.aana)}
                onChange={(value) => onChange("aana", value)}
            />

            <AreaInput
                label="Paisa"
                value={String(values.paisa)}
                onChange={(value) => onChange("paisa", value)}
            />

            <AreaInput
                label="Daam"
                value={String(values.daam)}
                onChange={(value) => onChange("daam", value)}
            />
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| RAPD Display
|--------------------------------------------------------------------------
*/

interface RAPDDisplayProps {
    title: string;
    area: LandArea;
    sqft: number;
    emphasized?: boolean;
}

function RAPDDisplay({
    title,
    area,
    sqft,
    emphasized = false,
}: RAPDDisplayProps) {
    return (
        <div
            className={
                emphasized
                    ? "rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/40"
                    : "rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            }
        >
            <div
                className={
                    emphasized
                        ? "text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400"
                        : "text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
                }
            >
                {title}
            </div>

            <div
                className={
                    emphasized
                        ? "mt-2 text-xl font-bold text-indigo-700 dark:text-indigo-300"
                        : "mt-2 text-xl font-bold text-gray-900 dark:text-white"
                }
            >
                {area.ropani} Ropani
            </div>

            <div
                className={
                    emphasized
                        ? "mt-1 text-sm text-indigo-700 dark:text-indigo-300"
                        : "mt-1 text-sm text-gray-600 dark:text-gray-300"
                }
            >
                {area.aana} Aana {area.paisa} Paisa {area.daam} Daam
            </div>

            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {formatNumber(sqft)} sq.ft
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Result Row
|--------------------------------------------------------------------------
*/

interface ResultRowProps {
    label: string;
    value: string;
    highlight?: boolean;
}

function ResultRow({ label, value, highlight = false }: ResultRowProps) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 py-3 last:border-0 dark:border-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">
                {label}
            </span>

            <span
                className={
                    highlight
                        ? "text-right text-base font-bold text-indigo-600 dark:text-indigo-400"
                        : "text-right text-sm font-semibold text-gray-900 dark:text-white"
                }
            >
                {value}
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export default function LandCalculator() {
    /*
    |--------------------------------------------------------------------------
    | Total Land Input
    |--------------------------------------------------------------------------
    */

    const [totalLand, setTotalLand] = useState<LandArea>({
        ropani: 0,
        aana: 0,
        paisa: 0,
        daam: 0,
    });

    /*
    |--------------------------------------------------------------------------
    | Road / Waste Input
    |--------------------------------------------------------------------------
    */

    const [roadWaste, setRoadWaste] = useState<LandArea>({
        ropani: 0,
        aana: 0,
        paisa: 0,
        daam: 0,
    });

    /*
    |--------------------------------------------------------------------------
    | Price
    |--------------------------------------------------------------------------
    */

    const [pricePerAana, setPricePerAana] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Tax Rates
    |--------------------------------------------------------------------------
    */

    const [thaileRate, setThaileRate] = useState("");

    const [gainTaxRate, setGainTaxRate] = useState("");

    const [registrationRate, setRegistrationRate] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Update Area Field
    |--------------------------------------------------------------------------
    */

    function updateTotalLand(field: keyof LandArea, value: string) {
        setTotalLand((current) => ({
            ...current,
            [field]: safeNumber(value),
        }));
    }

    function updateRoadWaste(field: keyof LandArea, value: string) {
        setRoadWaste((current) => ({
            ...current,
            [field]: safeNumber(value),
        }));
    }

    /*
    |--------------------------------------------------------------------------
    | Calculations
    |--------------------------------------------------------------------------
    */

    const calculations = useMemo<Calculations>(() => {
        const totalDaam = rapdToDaam(totalLand);

        const requestedWasteDaam = rapdToDaam(roadWaste);

        /*
        |--------------------------------------------------------------------------
        | Waste cannot exceed total land.
        |--------------------------------------------------------------------------
        */

        const wasteDaam = Math.min(requestedWasteDaam, totalDaam);

        const usefulDaam = totalDaam - wasteDaam;

        const totalRAPD = daamToRAPD(totalDaam);

        const wasteRAPD = daamToRAPD(wasteDaam);

        const usefulRAPD = daamToRAPD(usefulDaam);

        /*
        |--------------------------------------------------------------------------
        | Square Feet
        |--------------------------------------------------------------------------
        */

        const totalSqft = daamToSqft(totalDaam);

        const wasteSqft = daamToSqft(wasteDaam);

        const usefulSqft = daamToSqft(usefulDaam);

        /*
        |--------------------------------------------------------------------------
        | Land Value
        |--------------------------------------------------------------------------
        |
        | Price is entered per Aana.
        |
        | 1 Aana = 16 Daam
        |
        */

        const price = safeNumber(pricePerAana);

        const usefulAana = usefulDaam / DAAM_PER_AANA;

        const landValue = usefulAana * price;

        /*
        |--------------------------------------------------------------------------
        | Thaile
        |--------------------------------------------------------------------------
        */

        const thaile = landValue * (safeNumber(thaileRate) / 100);

        /*
        |--------------------------------------------------------------------------
        | Gain Tax
        |--------------------------------------------------------------------------
        */

        const gainTax = landValue * (safeNumber(gainTaxRate) / 100);

        /*
        |--------------------------------------------------------------------------
        | Registration / Pass
        |--------------------------------------------------------------------------
        */

        const registration = landValue * (safeNumber(registrationRate) / 100);

        /*
        |--------------------------------------------------------------------------
        | Totals
        |--------------------------------------------------------------------------
        */

        const totalCharges = thaile + gainTax + registration;

        const grandTotal = landValue + totalCharges;

        return {
            totalDaam,
            wasteDaam,
            usefulDaam,

            totalArea: totalRAPD,
            wasteArea: wasteRAPD,
            usefulArea: usefulRAPD,

            totalSqft,
            wasteSqft,
            usefulSqft,

            pricePerAana: price,
            landValue,

            thaileRate: safeNumber(thaileRate),
            thaileAmount: thaile,

            gainTaxRate: safeNumber(gainTaxRate),
            gainTaxAmount: gainTax,

            registrationRate: safeNumber(registrationRate),
            registrationAmount: registration,

            totalCharges,
            grandTotal,
        };
    }, [
        totalLand,
        roadWaste,
        pricePerAana,
        thaileRate,
        gainTaxRate,
        registrationRate,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Reset
    |--------------------------------------------------------------------------
    */

    function resetCalculator() {
        setTotalLand({
            ropani: 0,
            aana: 0,
            paisa: 0,
            daam: 0,
        });

        setRoadWaste({
            ropani: 0,
            aana: 0,
            paisa: 0,
            daam: 0,
        });

        setPricePerAana("");
        setThaileRate("");
        setGainTaxRate("");
        setRegistrationRate("");
    }

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* =========================================================
                    HEADER
                ========================================================= */}

                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Land Calculator
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
                        Calculate land area, road or waste deduction, useful
                        land, land value, taxes and registration charges using
                        the Ropani-Aana-Paisa-Daam system.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* =====================================================
                        LEFT COLUMN
                    ===================================================== */}

                    <div className="space-y-6">
                        {/* -------------------------------------------------
                            TOTAL LAND
                        ------------------------------------------------- */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <SectionHeader
                                number={1}
                                title="Total Land Area"
                                description="Enter the total land area in Ropani, Aana, Paisa and Daam."
                            />

                            <RAPDInputGroup
                                values={totalLand}
                                onChange={updateTotalLand}
                            />

                            <div className="mt-5">
                                <RAPDDisplay
                                    title="Total Land"
                                    area={calculations.totalArea}
                                    sqft={calculations.totalSqft}
                                />
                            </div>
                        </section>

                        {/* -------------------------------------------------
                            ROAD / WASTE
                        ------------------------------------------------- */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <SectionHeader
                                number={2}
                                title="Road / Waste Land"
                                description="Enter the portion of land lost, deducted or occupied by road."
                            />

                            <RAPDInputGroup
                                values={roadWaste}
                                onChange={updateRoadWaste}
                            />

                            <div className="mt-5">
                                <RAPDDisplay
                                    title="Road / Waste"
                                    area={calculations.wasteArea}
                                    sqft={calculations.wasteSqft}
                                />
                            </div>
                        </section>

                        {/* -------------------------------------------------
                            USEFUL LAND
                        ------------------------------------------------- */}

                        <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/30">
                            <SectionHeader
                                number={3}
                                title="Useful Land / Area of Interest"
                                description="Total land minus road or waste land."
                            />

                            <RAPDDisplay
                                title="Area of Interest"
                                area={calculations.usefulArea}
                                sqft={calculations.usefulSqft}
                                emphasized
                            />

                            <div className="mt-4 rounded-xl bg-white p-4 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Calculation
                                    </span>

                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Total − Road / Waste
                                    </span>
                                </div>

                                <div className="mt-3 border-t border-gray-100 pt-3 text-center dark:border-gray-800">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {calculations.totalArea.ropani} Ropani{" "}
                                        {calculations.totalArea.aana} Aana{" "}
                                        {calculations.totalArea.paisa} Paisa{" "}
                                        {calculations.totalArea.daam} Daam
                                    </span>

                                    <span className="mx-2 text-gray-400">
                                        −
                                    </span>

                                    <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                        {calculations.wasteArea.ropani} Ropani{" "}
                                        {calculations.wasteArea.aana} Aana{" "}
                                        {calculations.wasteArea.paisa} Paisa{" "}
                                        {calculations.wasteArea.daam} Daam
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* -------------------------------------------------
                            PRICE
                        ------------------------------------------------- */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <SectionHeader
                                number={4}
                                title="Land Price"
                                description="Enter the price per Aana to calculate the useful land value."
                            />

                            <MoneyInput
                                label="Price per Aana"
                                value={pricePerAana}
                                onChange={setPricePerAana}
                                suffix="Rs./Aana"
                                placeholder="e.g. 1000000"
                            />

                            <div className="mt-5 rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Useful Land Value
                                </div>

                                <div className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(calculations.landValue)}
                                </div>

                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {formatNumber(
                                        calculations.usefulDaam / DAAM_PER_AANA,
                                        4,
                                    )}{" "}
                                    Aana ×{" "}
                                    {formatCurrency(calculations.pricePerAana)}
                                </div>
                            </div>
                        </section>

                        {/* -------------------------------------------------
                            TAXES
                        ------------------------------------------------- */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <SectionHeader
                                number={5}
                                title="Taxes & Charges"
                                description="Enter the applicable percentage rates for this transaction."
                            />

                            <div className="grid gap-4 sm:grid-cols-3">
                                <MoneyInput
                                    label="Thaile"
                                    value={thaileRate}
                                    onChange={setThaileRate}
                                    suffix="%"
                                    placeholder="0"
                                />

                                <MoneyInput
                                    label="लाभांश / Gain Tax"
                                    value={gainTaxRate}
                                    onChange={setGainTaxRate}
                                    suffix="%"
                                    placeholder="0"
                                />

                                <MoneyInput
                                    label="Pass / Registration"
                                    value={registrationRate}
                                    onChange={setRegistrationRate}
                                    suffix="%"
                                    placeholder="0"
                                />
                            </div>

                            <div className="mt-5 rounded-xl border border-gray-200 px-4 dark:border-gray-700">
                                <ResultRow
                                    label="Thaile"
                                    value={formatCurrency(
                                        calculations.thaileAmount,
                                    )}
                                />

                                <ResultRow
                                    label="लाभांश / Gain Tax"
                                    value={formatCurrency(
                                        calculations.gainTaxAmount,
                                    )}
                                />

                                <ResultRow
                                    label="Pass / Registration"
                                    value={formatCurrency(
                                        calculations.registrationAmount,
                                    )}
                                />

                                <ResultRow
                                    label="Total Charges"
                                    value={formatCurrency(
                                        calculations.totalCharges,
                                    )}
                                    highlight
                                />
                            </div>
                        </section>

                        {/* RESET */}

                        <button
                            type="button"
                            onClick={resetCalculator}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Reset Calculator
                        </button>
                    </div>

                    {/* =====================================================
                        RIGHT COLUMN — RESULT
                    ===================================================== */}

                    <div className="lg:sticky lg:top-6 lg:self-start">
                        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            {/* RESULT HEADER */}

                            <div className="bg-gray-900 px-6 py-6 dark:bg-gray-800">
                                <div className="text-xs font-medium tracking-wider text-gray-400">
                                    LAND CALCULATION
                                </div>

                                <h2 className="mt-1 text-xl font-bold text-white">
                                    Calculation Result
                                </h2>
                            </div>

                            <div className="p-6">
                                {/* -------------------------------------------------
                                    AREA RESULT
                                ------------------------------------------------- */}

                                <div className="mb-7">
                                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Land Area
                                    </h3>

                                    <ResultRow
                                        label="Total Land"
                                        value={
                                            calculations.totalArea.ropani +
                                            " Ropani " +
                                            calculations.totalArea.aana +
                                            " Aana " +
                                            calculations.totalArea.paisa +
                                            " Paisa " +
                                            calculations.totalArea.daam +
                                            " Daam"
                                        }
                                    />

                                    <ResultRow
                                        label="Road / Waste"
                                        value={
                                            calculations.wasteArea.ropani +
                                            " Ropani " +
                                            calculations.wasteArea.aana +
                                            " Aana " +
                                            calculations.wasteArea.paisa +
                                            " Paisa " +
                                            calculations.wasteArea.daam +
                                            " Daam"
                                        }
                                    />

                                    <ResultRow
                                        label="Useful Land / Area of Interest"
                                        value={
                                            calculations.usefulArea.ropani +
                                            " Ropani " +
                                            calculations.usefulArea.aana +
                                            " Aana " +
                                            calculations.usefulArea.paisa +
                                            " Paisa " +
                                            calculations.usefulArea.daam +
                                            " Daam"
                                        }
                                        highlight
                                    />

                                    <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Square Feet Conversion
                                        </div>

                                        <div className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                                            {formatNumber(
                                                calculations.usefulSqft,
                                            )}{" "}
                                            sq.ft
                                        </div>
                                    </div>
                                </div>

                                {/* -------------------------------------------------
                                    LAND VALUE
                                ------------------------------------------------- */}

                                <div className="mb-7">
                                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Land Value
                                    </h3>

                                    <ResultRow
                                        label="Price / Aana"
                                        value={formatCurrency(
                                            calculations.pricePerAana,
                                        )}
                                    />

                                    <ResultRow
                                        label="Useful Land Value"
                                        value={formatCurrency(
                                            calculations.landValue,
                                        )}
                                        highlight
                                    />
                                </div>

                                {/* -------------------------------------------------
                                    TAXES
                                ------------------------------------------------- */}

                                <div className="mb-7">
                                    <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Taxes & Charges
                                    </h3>

                                    <ResultRow
                                        label={
                                            "Thaile (" +
                                            calculations.thaileRate +
                                            "%)"
                                        }
                                        value={formatCurrency(
                                            calculations.thaileAmount,
                                        )}
                                    />

                                    <ResultRow
                                        label={
                                            "Gain Tax (" +
                                            calculations.gainTaxRate +
                                            "%)"
                                        }
                                        value={formatCurrency(
                                            calculations.gainTaxAmount,
                                        )}
                                    />

                                    <ResultRow
                                        label={
                                            "Registration (" +
                                            calculations.registrationRate +
                                            "%)"
                                        }
                                        value={formatCurrency(
                                            calculations.registrationAmount,
                                        )}
                                    />

                                    <ResultRow
                                        label="Total Charges"
                                        value={formatCurrency(
                                            calculations.totalCharges,
                                        )}
                                        highlight
                                    />
                                </div>

                                {/* -------------------------------------------------
                                    GRAND TOTAL
                                ------------------------------------------------- */}

                                <div className="rounded-2xl bg-indigo-600 p-6 text-white">
                                    <div className="text-sm font-medium opacity-80">
                                        Estimated Grand Total
                                    </div>

                                    <div className="mt-2 text-3xl font-bold tracking-tight">
                                        {formatCurrency(
                                            calculations.grandTotal,
                                        )}
                                    </div>

                                    <div className="mt-2 text-xs opacity-70">
                                        Useful land value + calculated taxes and
                                        charges
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
