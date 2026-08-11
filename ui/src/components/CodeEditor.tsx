import { useEffect, useRef, useState, useCallback } from "react";
import { Box } from "@chakra-ui/react";
import Prism from "prismjs";
import "prismjs/components/prism-java";

interface CodeEditorProps {
  code: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (code: string) => void;
  showLineNumbers?: boolean;
}

export default function CodeEditor({
  code,
  language = "java",
  readOnly = true,
  onChange,
  showLineNumbers = true,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [localCode, setLocalCode] = useState(code);

  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.innerHTML = Prism.highlight(
        localCode,
        Prism.languages[language] ?? Prism.languages.markup,
        language
      );
    }
  }, [localCode, language]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setLocalCode(value);
      onChange?.(value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        const newValue = value.substring(0, start) + "    " + value.substring(end);
        setLocalCode(newValue);
        onChange?.(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        });
      }
    },
    [onChange]
  );

  const lines = localCode.split("\n");

  return (
    <Box
      position="relative"
      bg="gray.900"
      borderRadius="8px"
      border="1px solid"
      borderColor="gray.700"
      overflow="hidden"
    >
      <Box display="flex" fontFamily="'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace" fontSize="0.85rem" lineHeight="1.6">
        {showLineNumbers && (
          <Box
            bg="gray.800"
            color="gray.500"
            px={3}
            py={4}
            textAlign="right"
            userSelect="none"
            minW="3rem"
            borderRight="1px solid"
            borderColor="gray.700"
          >
            {lines.map((_, i) => (
              <div key={i} style={{ height: "1.6em" }}>
                {i + 1}
              </div>
            ))}
          </Box>
        )}
        <Box position="relative" flex={1} minW={0}>
          {readOnly ? (
            <Box
              ref={preRef}
              as="pre"
              p={4}
              m={0}
              color="green.300"
              whiteSpace="pre"
              overflow="hidden"
              dangerouslySetInnerHTML={{ __html: "" }}
            />
          ) : (
            <>
              <Box
                ref={preRef}
                as="pre"
                p={4}
                m={0}
                color="green.300"
                whiteSpace="pre"
                overflow="hidden"
                pointerEvents="none"
                position="absolute"
                top={0}
                left={0}
                right={0}
                dangerouslySetInnerHTML={{ __html: "" }}
              />
              <textarea
                ref={textareaRef}
                value={localCode}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: `${lines.length * 1.6 + 2}em`,
                  padding: "1em",
                  margin: 0,
                  fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
                  fontSize: "0.85rem",
                  lineHeight: "1.6",
                  color: "transparent",
                  caretColor: "white",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  whiteSpace: "pre",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              />
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
