#!/usr/bin/env node
import { execSync } from "child_process";
import ora from "ora";
import pc from "picocolors";
import prompts from "prompts";

(async () => {
  const spinner = ora("Start cleaning up local branches").start();

  // Fetch latest changes from remote
  execSync("git fetch");

  // Get the names of all local branches
  const localBranches = execSync("git branch")
    .toString()
    .split("\n")
    .map((branch) => branch.replace("*", "").trim())
    .filter(
      (branch) => branch !== "" && branch !== "master" && branch !== "main"
    );

  // Get the names of all remote branches
  const remoteBranches = execSync("git branch -r")
    .toString()
    .split("\n")
    .map((branch) => branch.trim())
    .filter((branch) => branch !== "");

  // Get the names of all local branches that do not have a corresponding remote branch
  const localOnlyBranches = localBranches.filter(
    (branch) => !remoteBranches.includes(`origin/${branch}`)
  );

  if (localOnlyBranches.length > 0) {
    spinner.info("\n Local branches to be deleted: \n" + localOnlyBranches);

    const response = await prompts({
      type: "confirm",
      name: "confirmValue",
      message: "Are you sure want to delete the local branches?",
      initial: true,
    });

    if (response.confirmValue) {
      spinner.text = "Removing local branches";
    }

    spinner.succeed(pc.green("Successfully deleted the local branches"));
    return;
  }

  spinner.succeed(pc.green("No local branches to be deleted"));
  // Delete each local-only branch
  // localOnlyBranches.forEach((branch) => {
  //   execSync(`git branch -D ${branch}`);
  // });
})();
