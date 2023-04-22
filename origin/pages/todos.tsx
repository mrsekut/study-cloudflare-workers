import { prisma } from "@/lib/prisma";
import { InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { useRef } from "react";

export async function getServerSideProps() {
	const todos = await prisma.todo.findMany();

	return {
		props: {
			todos,
		},
	};
}

function TodoList({
	todos,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const title = useRef<HTMLInputElement>(null);
	const description = useRef<HTMLInputElement>(null);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const res = await fetch("/api/todos", {
			method: "POST",
			body: JSON.stringify({
				title: title.current?.value,
				description: description.current?.value,
			}),
		});

		if (res.status === 200) {
			router.replace(router.asPath);
		}
	};

	return (
		<div className="container mx-auto mt-8">
			<h1 className="text-2xl font-bold mb-4">Todo List</h1>
			<form onSubmit={handleSubmit} className="flex mb-4">
				<input
					ref={title}
					type="text"
					className="border border-gray-500 p-2 flex-1 mr-4"
					placeholder="Enter a new todo title"
				/>
				<input
					type="text"
					ref={description}
					className="border border-gray-500 p-2 flex-1 mr-4"
					placeholder="Enter a new todo description"
				/>
				<button className="bg-blue-500 text-white p-2 rounded">Add Todo</button>
			</form>
			{todos.length === 0 ? (
				<p>No todos yet!</p>
			) : (
				<ul className="list-disc">
					{todos.map((todo, index) => (
						<li key={index} className="mb-2">
							<h2 className="font-bold">{todo.title}</h2>
							<p className="mb-2">{todo.description}</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default TodoList;
