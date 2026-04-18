import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export function useDebouncedTopicSave(topicId, snapshot, delay = 600) {
  const { user, patchTopicProgress, persistTopicProgress } = useAuth();

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(async () => {
      patchTopicProgress(topicId, snapshot);
      try {
        await persistTopicProgress(topicId, snapshot);
      } catch {
        /* offline / server down — local patch still applied */
      }
    }, delay);
    return () => clearTimeout(t);
  }, [user, topicId, snapshot, delay, patchTopicProgress, persistTopicProgress]);
}
