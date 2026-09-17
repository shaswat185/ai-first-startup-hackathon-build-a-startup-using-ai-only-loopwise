import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Row, Col, Button } from "react-bootstrap";
import PageHeader from "../components/PageHeader";
import ErrorAlert from "../components/ErrorAlert";
import { businessApi, type BusinessInput } from "../services/businessApi";
import { getApiErrorMessage } from "../services/apiClient";
import type { BusinessCategory } from "../types";

const CATEGORIES: BusinessCategory[] = [
  "Retail Store",
  "Restaurant / Café",
  "Freelancer / Service",
  "E-commerce",
  "Education / Coaching",
  "Healthcare / Wellness",
  "Local Shop",
  "Other",
];

const emptyForm = {
  name: "",
  category: "" as BusinessCategory | "",
  location: "",
  description: "",
  productsOrServices: "",
  targetCustomers: "",
  monthlyBudget: "",
  goal: "",
  monthlyRevenue: "",
  customerCount: "",
  averageOrderValue: "",
  websiteUrl: "",
  socialMediaPresence: "",
  employeeCount: "",
};

export default function BusinessSetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.category || !form.location || !form.description) {
      setError("Please fill in the business name, category, location, and description.");
      return;
    }
    if (!form.productsOrServices || !form.targetCustomers || !form.goal || form.monthlyBudget === "") {
      setError("Please fill in products/services, target customers, monthly budget, and your main goal.");
      return;
    }

    const payload: BusinessInput = {
      name: form.name.trim(),
      category: form.category as BusinessCategory,
      location: form.location.trim(),
      description: form.description.trim(),
      productsOrServices: form.productsOrServices.trim(),
      targetCustomers: form.targetCustomers.trim(),
      monthlyBudget: Number(form.monthlyBudget),
      goal: form.goal.trim(),
      ...(form.monthlyRevenue !== "" ? { monthlyRevenue: Number(form.monthlyRevenue) } : {}),
      ...(form.customerCount !== "" ? { customerCount: Number(form.customerCount) } : {}),
      ...(form.averageOrderValue !== "" ? { averageOrderValue: Number(form.averageOrderValue) } : {}),
      ...(form.websiteUrl !== "" ? { websiteUrl: form.websiteUrl.trim() } : {}),
      ...(form.socialMediaPresence !== "" ? { socialMediaPresence: form.socialMediaPresence.trim() } : {}),
      ...(form.employeeCount !== "" ? { employeeCount: Number(form.employeeCount) } : {}),
    };

    setSubmitting(true);
    try {
      const business = await businessApi.create(payload);
      navigate(`/diagnose?businessId=${business.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Set Up Your Business"
        subtitle="Only fill in what you know — optional fields can stay blank."
      />

      {error && <ErrorAlert message={error} />}

      <Card className="fmb-card">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Business name *</Form.Label>
                  <Form.Control value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Business category *</Form.Label>
                  <Form.Select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value as BusinessCategory)}
                    required
                  >
                    <option value="">Select a category…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Location *</Form.Label>
              <Form.Control
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="City, region, or 'online only'"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Business description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="What does this business do, day to day?"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Products or services *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.productsOrServices}
                    onChange={(e) => update("productsOrServices", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Target customers *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={form.targetCustomers}
                    onChange={(e) => update("targetCustomers", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Monthly budget (INR) *</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.monthlyBudget}
                    onChange={(e) => update("monthlyBudget", e.target.value)}
                    placeholder="How much can you realistically spend fixing this?"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Main business goal *</Form.Label>
                  <Form.Control
                    value={form.goal}
                    onChange={(e) => update("goal", e.target.value)}
                    placeholder="e.g. grow repeat customers"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />
            <p className="fmb-muted small mb-3">
              Optional — only fill these in if you actually track them. Leave blank if you don't know.
            </p>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Current monthly revenue</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.monthlyRevenue}
                    onChange={(e) => update("monthlyRevenue", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Current customer count</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.customerCount}
                    onChange={(e) => update("customerCount", e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Average order value</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.averageOrderValue}
                    onChange={(e) => update("averageOrderValue", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Website URL</Form.Label>
                  <Form.Control
                    value={form.websiteUrl}
                    onChange={(e) => update("websiteUrl", e.target.value)}
                    placeholder="Leave blank if none"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Social media presence</Form.Label>
                  <Form.Control
                    value={form.socialMediaPresence}
                    onChange={(e) => update("socialMediaPresence", e.target.value)}
                    placeholder="e.g. Instagram, 2k followers"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of employees</Form.Label>
                  <Form.Control
                    type="number"
                    min={0}
                    value={form.employeeCount}
                    onChange={(e) => update("employeeCount", e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving…" : "Save Business & Continue"}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
