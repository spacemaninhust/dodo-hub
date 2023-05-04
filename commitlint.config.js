module.exports = {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "type-enum": [
            2,
            "always",
            [
                "update", // 更新某功能（不是 feat，不是 fix）
                "feat", // 新功能（feature）
                "fix", // 修补 bug
                "refactor", // 重构（即不是新增功能，也不是修改 bug 的代码变动）
                "docs", // 文档（documentation）
                "chore", // 构建过程或辅助工具的变动
                "style", // 格式（不影响代码运行的变动）
                "revert", // 还原
            ],
        ],
        'type-case': [0],
        'type-empty': [0],
        'scope-empty': [0],
        'scope-case': [0],
        'subject-full-stop': [0, 'never'],
        'subject-case': [0, 'never'],
        'header-max-length': [0, 'always', 72]
    },
};
