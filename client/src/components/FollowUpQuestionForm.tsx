import { useState, type FormEvent } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { MessageCircleQuestion } from "lucide-react";
import type { FollowUpQuestion } from "../types";

interface FollowUpQuestionFormProps {
  questions: FollowUpQuestion[];
  onSubmit: (answers: { question: string; answer: string }[]) => void;
  submitting?: boolean;
}

export default function FollowUpQuestionForm({ questions, onSubmit, submitting }: FollowUpQuestionFormProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (questions.length === 0) return null;

  function handleChange(idx: number, value: string) {
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = questions.map((q, idx) => ({
      question: q.question,
      answer: answers[idx]?.trim() || "",
    }));
    onSubmit(payload);
  }

  return (
    <Card className="fmb-card">
      <Card.Body>
        <div className="d-flex align-items-center gap-2 mb-2">
          <MessageCircleQuestion size={18} className="text-primary" />
          <Card.Title className="h6 mb-0">A few more details would sharpen this diagnosis</Card.Title>
        </div>
        <Form onSubmit={handleSubmit}>
          {questions.map((q, idx) => (
            <Form.Group className="mb-3" key={idx}>
              <Form.Label className="small fw-medium">{q.question}</Form.Label>
              <div className="fmb-muted small mb-1">{q.reason}</div>
              <Form.Control
                as="textarea"
                rows={2}
                value={answers[idx] || ""}
                onChange={(e) => handleChange(idx, e.target.value)}
                placeholder="Your answer (or leave blank to skip)"
              />
            </Form.Group>
          ))}
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Refining diagnosis…" : "Submit Answers & Refine Diagnosis"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}
