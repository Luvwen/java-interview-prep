import { useEffect, useRef } from "react";
import { Box, Code } from "@chakra-ui/react";
import Prism from "prismjs";
import "prismjs/components/prism-java";

export default function CodeBlock({ code }: { code: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) Prism.highlightElement(ref.current);
  }, [code]);

  return (
    <Box mb={3}>
      <Box
        as="pre"
        bg="#272822"
        border="1px solid"
        borderColor="#3e3d32"
        borderRadius="8px"
        p={4}
        overflowX="auto"
        overflowY="visible"
        fontSize="0.85rem"
        lineHeight="1.6"
        fontFamily="'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace"
      >
        <Code
          ref={ref}
          as="code"
          className="language-java"
          bg="transparent"
          color="#f8f8f2"
          p={0}
          display="block"
          whiteSpace="pre"
          minWidth="0"
        >
          {code}
        </Code>
      </Box>
    </Box>
  );
}
