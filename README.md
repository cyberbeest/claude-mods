# claude-mods

Small mods for [Claude Code](https://claude.com/claude-code).

- **run-button**: when Claude suggests a command for you to run, written as a line starting with `! `, click Run above the prompt instead of copying and pasting it. Failures show up in a red box.

## run-button

Turns each `! command` line in Claude's replies into a `[ Run ] [ Skip ]` row above the prompt. Run executes the command with `bash -c` and shows the exit code and output. Nothing runs until you press Run.

Single-line commands only, no stdin or terminal, 2-minute timeout, last 1,500 characters of output.

### Install

```
/plugin install run-button --marketplace cyberbeest/claude-mods
```

From a shell: `claude plugin install run-button --marketplace cyberbeest/claude-mods`

## License

MIT
