import { useEffect, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { colors } from "../colors";

function TimerBar({ totalSeconds, onTimeUp, running }: { totalSeconds: number; onTimeUp: () => void; running: boolean }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const startTime = useRef<number>(Date.now());
  const pausedRemaining = useRef(totalSeconds);

  useEffect(() => {
    if (running) { startTime.current = Date.now(); }
    else { pausedRemaining.current = remaining; }
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      const left = pausedRemaining.current - elapsed;
      if (left <= 0) { setRemaining(0); clearInterval(interval); onTimeUp(); }
      else { setRemaining(left); }
    }, 250);
    return () => clearInterval(interval);
  }, [running, onTimeUp]);

  const percent = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 10;

  return (
    <Flex align="center" gap={3} mb={4} role="timer" aria-label={`${minutes} minutos ${seconds} segundos restantes`}>
      <Box flex={1} h="8px" bg={colors.surfaceHover} borderRadius="full" overflow="hidden">
        <Box h="100%" bg={isLow ? colors.error : colors.success} borderRadius="full" transition="width 0.25s linear" w={`${percent}%`} />
      </Box>
      <Text fontWeight="600" style={{ fontVariantNumeric: "tabular-nums" }} minW="48px" textAlign="right" color={isLow ? colors.error : "inherit"}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </Text>
    </Flex>
  );
}

export default TimerBar;
