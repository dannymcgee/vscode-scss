import chalk from "chalk";
import cp from "child_process";
import path from "path";

const wsRoot = path.resolve(__dirname, "../../");
const nx = `node ${path.join(wsRoot, "node_modules/nx/bin/nx.js")}`;

async function main() {
	try {
		await run(`${nx} build snapshot-resolver`);
		await run(`npm link`, path.join(wsRoot, "dist/@sassy/snapshot-resolver"));
		await run(`npm link @sassy/snapshot-resolver`);
	}
	catch (err) {
		const label = chalk.red`> ` + chalk.bold.red.inverse(" ERROR ");
		const error = chalk.bold.red(err.message);
		console.log(`${label} ${error}`);
	}
}

main();

function run(command: string, cwd = wsRoot): Promise<void> {
	const [cmd, ...args] = command.split(" ");

	console.log(fmt(cmd, cwd, ...args));

	return new Promise<void>((resolve, reject) => {
		const proc = cp.spawn(cmd, args, {
			cwd,
			stdio: "pipe",
			shell: true,
		});

		let stderr = "";
		if (proc.stderr) {
			proc.stderr.setEncoding("utf-8");
			proc.stderr.on("data", chunk => {
				stderr += chunk;
			});
		}

		proc.on("error", reject)
			.on("close", code => {
				if (code) {
					console.log(stderr);
					reject(new Error(`${cmd} exited with code ${code}`));
				} else {
					resolve();
				}
			});
	});
}

function fmt(cmd: string, cwd: string, ...args: string[]): string {
	const prompt = chalk.gray`>`;

	if (cmd === "node") {
		cmd = "nx";
		args = args.slice(1);
	}

	cmd = chalk.yellow.italic(cmd);
	args = args.map((arg, idx) => {
		if (idx === 0)
			return chalk.blueBright.bold(arg);
		if (arg.startsWith("-"))
			return chalk.magenta(arg);

		return arg;
	});
	cwd = cwd === wsRoot
		? ""
		: chalk.gray`[cwd: "${cwd.replace(wsRoot, ".").replace(/[/\\]/g, "/")}"]`;

	return [prompt, cmd, args, cwd].flat().join(" ");
}
