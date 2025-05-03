<superpromptor-input>

At the end of your response, respond with the following XML section (if applicable).

XML Section:

- Do not get lazy. Always output the full code in the XML section.
- Enclose this entire section in a markdown codeblock
- Include all of the changed files
- Specify each file operation with CREATE, UPDATE, or DELETE
- For CREATE or UPDATE operations, include the full file code
- Include the full file path (relative to the project directory, good: app/page.tsx, bad: /Users/mckaywrigley/Desktop/projects/new-chat-template/app/page.tsx)
- Enclose the code with ![CDATA[CODE HERE]]
- Use the following XML structure:

```
<code_changes>
  <changed_files>
    <file>
      <file_operation>__FILE OPERATION HERE__</file_operation>
      <file_path>__FILE PATH HERE__</file_path>
      <file_code><![CDATA[
__FULL FILE CODE HERE__
]]></file_code>
    </file>
    __REMAINING FILES HERE__
  </changed_files>
</code_changes>
```

Here is my current code:

<superpromptor-file>