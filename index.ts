#!/usr/bin/env node
import { execSync } from "child_process";
import ora from "ora";
import pc from "picocolors";
import prompts from "prompts";

const printText = console.log;

(async () => {
  const spinner = ora("Start cleaning up local branches").start();

  try {
    // Fetch latest changes from remote
    execSync("git fetch");

    // Get the name of the current branch
    const currentBranch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();

    if (!["master", "main"].includes(currentBranch)) {
      throw Error(`You need to checkout to "master" or "main" branch first`);
    }

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
      spinner.info(
        "Local branches to be deleted: \n" +
          localOnlyBranches.map((branch) => `- ${branch}`).join("\n") +
          "\n"
      );

      const response = await prompts({
        type: "confirm",
        name: "confirmValue",
        message: "Are you sure want to delete the local branches?",
        initial: true,
      });

      printText();

      if (response.confirmValue) {
        // Delete each local-only branch
        localOnlyBranches.forEach((branch) => {
          execSync(`git branch -D ${branch}`);
        });

        spinner.succeed(pc.green("Successfully deleted the local branches"));
      } else {
        spinner.fail(pc.red("Cancel deleting the local branches"));
      }

      return;
    }

    spinner.succeed(pc.green("No local branches to be deleted"));
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    spinner.fail(pc.red("Error: " + errorMessage));
  }
})();
