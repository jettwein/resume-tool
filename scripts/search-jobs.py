#!/usr/bin/env python3
"""Standalone job search script. Reads JSON from stdin, writes JSON to stdout."""
import json
import sys
from jobspy import scrape_jobs


def normalize_salary(row):
    salary = {
        "min": None,
        "max": None,
        "period": None,
        "currency": "USD",
        "display": None,
    }

    min_amount = row.get("min_amount")
    max_amount = row.get("max_amount")
    interval = row.get("interval")

    if min_amount is not None and not _is_nan(min_amount):
        salary["min"] = int(float(min_amount))
    if max_amount is not None and not _is_nan(max_amount):
        salary["max"] = int(float(max_amount))

    if interval and not _is_nan(interval):
        salary["period"] = str(interval).lower()

    currency = row.get("currency")
    if currency and not _is_nan(currency):
        salary["currency"] = str(currency)

    if salary["min"] or salary["max"]:
        parts = []
        if salary["min"]:
            parts.append(f"${salary['min']:,}")
        if salary["max"]:
            parts.append(f"${salary['max']:,}")
        display = " - ".join(parts)
        if salary["period"]:
            display += f"/{salary['period']}"
        salary["display"] = display

    return salary


def _is_nan(value):
    try:
        return str(value).lower() == "nan" or (isinstance(value, float) and value != value)
    except (TypeError, ValueError):
        return False


def _safe_str(value):
    if value is None or _is_nan(value):
        return None
    return str(value)


def _safe_list(value):
    if value is None or _is_nan(value):
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        return [s.strip() for s in value.split(",") if s.strip()]
    return []


def main():
    body = json.loads(sys.stdin.read())

    keywords = body.get("keywords", "")
    location = body.get("location", "")
    remote = body.get("remote", False)
    job_type = body.get("jobType")
    results_wanted = min(body.get("resultsWanted", 20), 50)
    hours_old = body.get("hoursOld", 72)
    site_names = body.get("siteNames", ["indeed", "linkedin", "glassdoor"])

    if not keywords:
        json.dump({"error": "keywords is required"}, sys.stdout)
        sys.exit(1)

    job_type_map = {
        "fulltime": "fulltime",
        "parttime": "parttime",
        "contract": "contract",
        "internship": "internship",
    }

    scrape_kwargs = {
        "site_name": site_names,
        "search_term": keywords,
        "results_wanted": results_wanted,
        "hours_old": hours_old,
        "country_indeed": "USA",
        "linkedin_fetch_description": True,
    }

    if location:
        scrape_kwargs["location"] = location
    if remote:
        scrape_kwargs["is_remote"] = True
    if job_type and job_type in job_type_map:
        scrape_kwargs["job_type"] = job_type_map[job_type]

    jobs_df = scrape_jobs(**scrape_kwargs)

    results = []
    for _, row in jobs_df.iterrows():
        result = {
            "id": _safe_str(row.get("id")) or f"{row.get('site', 'unknown')}_{len(results)}",
            "title": _safe_str(row.get("title")) or "Untitled",
            "company": _safe_str(row.get("company")) or "Unknown",
            "location": _safe_str(row.get("location")) or "",
            "salary": normalize_salary(row),
            "description": _safe_str(row.get("description")) or "",
            "skills": _safe_list(row.get("skills")),
            "companyInfo": {
                "industry": _safe_str(row.get("company_industry")),
                "url": _safe_str(row.get("company_url")),
                "description": _safe_str(row.get("company_description")),
                "numEmployees": _safe_str(row.get("company_num_employees")),
                "revenue": _safe_str(row.get("company_revenue")),
            },
            "url": _safe_str(row.get("job_url")) or "",
            "datePosted": _safe_str(row.get("date_posted")),
            "source": _safe_str(row.get("site")) or "unknown",
            "jobType": _safe_str(row.get("job_type")),
            "isRemote": bool(row.get("is_remote", False)),
        }
        results.append(result)

    json.dump({
        "results": results,
        "totalFound": len(results),
        "searchParams": {
            "keywords": keywords,
            "location": location,
            "remote": remote,
            "jobType": job_type,
            "resultsWanted": results_wanted,
            "hoursOld": hours_old,
            "siteNames": site_names,
        },
    }, sys.stdout)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        json.dump({"error": str(e)}, sys.stdout)
        sys.exit(1)
