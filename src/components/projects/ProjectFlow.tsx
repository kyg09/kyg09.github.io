import type { CSSProperties } from "react";
import styles from "./ProjectFlow.module.css";

type ProjectFlowProps = {
  steps: readonly string[];
  caption: string;
};

// 핵심 업무 흐름을 순서가 있는 목록으로 표시합니다. 선과 화살표는 공통 스타일을 사용합니다.
export function ProjectFlow({ steps, caption }: ProjectFlowProps) {
  if (!steps.length) return null;

  return (
    <figure className={`project-flow ${styles.flow}`}>
      <ol
        className={`project-flow-steps ${styles.steps}`}
        aria-label="Key Flow"
        style={{ "--flow-count": steps.length } as CSSProperties}
      >
        {steps.map((step, index) => (
          <li className={`project-flow-step ${styles.step}`} key={`${index}-${step}`}>
            <span className={`project-flow-index ${styles.index}`} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={`project-flow-label ${styles.label}`}>{step}</span>
          </li>
        ))}
      </ol>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
