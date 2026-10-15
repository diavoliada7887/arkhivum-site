import styles from "./HomeSoftwareVisual.module.css";

/**
 * Decorative illustration for the homepage software direction.
 * This is a stylized development scene, not a screenshot of a released product.
 * Kept separate from DataVisual, which is reused on /software.
 */
export function HomeSoftwareVisual() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.halo} />
      <div className={styles.editor}>
        <div className={styles.editorBar}>
          <span className={styles.dots}><i /><i /><i /></span>
          <span className={styles.editorFilename}>process_batch.py</span>
          <span className={styles.editorLanguage}>PYTHON</span>
        </div>
        <div className={styles.code}>
          <div><span>01</span><code><b>from</b> pathlib <b>import</b> Path</code></div>
          <div><span>02</span><code>&nbsp;</code></div>
          <div><span>03</span><code><b>def</b> <em>collect_files</em>(root: Path):</code></div>
          <div><span>04</span><code>&nbsp;&nbsp;&nbsp;&nbsp;<b>return</b> <em>sorted</em>(</code></div>
          <div><span>05</span><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;p <b>for</b> p <b>in</b> root.rglob(<strong>"*"</strong>)</code></div>
          <div><span>06</span><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>if</b> p.is_file()</code></div>
          <div><span>07</span><code>&nbsp;&nbsp;&nbsp;&nbsp;)</code></div>
        </div>
        <div className={styles.editorStatus}>
          <span><i /> Логика и инструменты</span>
          <span>Python 3.12</span>
        </div>
      </div>

      <div className={styles.application}>
        <div className={styles.applicationBar}>
          <span className={styles.applicationMark}>Х</span>
          <span>
            <strong>Хвать</strong>
            <small>МОБИЛЬНОЕ ПРИЛОЖЕНИЕ</small>
          </span>
        </div>
        <div className={styles.appFieldLabel}>Ссылка на медиа</div>
        <div className={styles.appField}>
          <span>https://...</span>
          <span aria-hidden="true">↗</span>
        </div>
        <div className={styles.appFieldLabel}>Формат</div>
        <div className={styles.qualityRow}>
          <span>MP4 · 720p</span>
          <span>MP3</span>
        </div>
        <div className={styles.appAction}>Загрузить <span>↓</span></div>
      </div>

      <div className={styles.pipeline}>
        <span className={styles.pipelineLabel}>ОТ ИДЕИ ДО ПРИЛОЖЕНИЯ</span>
        <div className={styles.pipelineStages}>
          <span>Код</span><b>→</b><span>Интеграция</span><b>→</b><span>Продукт</span>
        </div>
      </div>
    </div>
  );
}
