import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
	name: string;
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	await new Promise((resolve) => setTimeout(() => resolve(true), 5000));

	console.log("called");
	res.status(200).json({ name: "hoge" });
}
