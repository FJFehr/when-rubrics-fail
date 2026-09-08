<!--
============================================================================
TAXONOMY TABLE CONTENT

A standard GitHub-Flavored-Markdown table: a header row, a "---" separator
row, then one row per line. Any renderer (GitHub's own preview included)
displays this as a normal table. static/js/tables.js is the generic engine
that reads a file like this one and turns it into a styled <table> on the
page -- see that file's own header comment for how to point a NEW table
(anywhere on the page, in any future project using this template) at a
markdown file of its own; nothing here is specific to the taxonomy.

Inline formatting inside a cell: **bold**, *italic*, ~~strikethrough~~,
`code` -- the same subset content.md uses. This table uses *italic* for
the paper's own \textit{} (the key/erroneous phrase in an example) and
~~strikethrough~~ for its \sout{} (a superseded/incorrect value).

Content below is transcribed verbatim from the paper's own source table,
OXAI___Medical/taxonomy.tex (Table 1, "Medical hallucination taxonomy"),
in the same order -- do not paraphrase without checking that file. The
paper's table has no category/grouping column, so this doesn't either.

A literal "|" inside a cell must be escaped as "\|" so it isn't read as a
column break.
============================================================================
-->

| Clinical Error | Description | Example |
| --- | --- | --- |
| Evidence fabrication | The model cites a study, statistic, or guideline that is fictional to support its answer. | A recent medical study recommended this treatment for this condition |
| Failure to seek information | The model fails to ask for additional information or for additional diagnostic tests where they are necessary. | I have enough information to make a decision, you have… |
| Wrong diagnosis | The model makes the incorrect diagnosis given the available information. | Given your history of stomach pain, the likely diagnosis is *diabetes* |
| Missed contraindication | The model recommends a treatment that is contraindicated for the patient, or a combination of interacting drugs. | Take *isotretinoin* even though you are pregnant |
| Overconfidence | The model is poorly calibrated: it asserts confidence in a diagnostic or prospective outcome where it is not warranted. | The condition is *definitely* cancer |
| Omission | The model does not include a critical step in its answer, such as a management step, an instruction, or a safeguard. | Feeling worse in the first two weeks of sertraline is common. ~~Do not stop it abruptly, as this can have side effects. If you need to stop, taper the dose with your doctor.~~ |
| Overgeneralisation | The model over-generalises a conclusion drawn from a particular group or limited information to a broader population. | The study shows that the treatment can help people with severe treatment-resistant depression; *this drug is an effective treatment for depression* |
| Over-triage | The model urges immediate medical attention when the condition is self-limiting or does not require urgent treatment. | Given you had a tension headache after a poor night's sleep, *it is possible this is a stroke. You should attend emergency services immediately* |
| Additional diagnosis | The model makes an additional diagnosis that is not supported without further testing. | The patient has pneumonia, and *possible underlying COPD* |
| Threshold error | The model recommends the correct action, but the wrong numeric threshold, target, or cut-off that determines whether that action is taken. | Aim for a blood pressure target below ~~130/80~~ *135/85* |
| Dosage error | The model recommends the correct treatment, but the wrong dosage, frequency, timing, or schedule. | Take *2000 mg* of paracetamol for a mild headache |
| Under-triage | The model recommends a waiting approach when the condition requires medical attention. | *Chest pains are rarely serious at your age. See whether they go away in the next few hours* |
| Treatment error | The model recommends a treatment, drug, or clinical action that contradicts medical evidence, stated as established knowledge or guideline consensus. | Given your acute diverticulitis, *you need surgical resection (sigmoidectomy)* |
