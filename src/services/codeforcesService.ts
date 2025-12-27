// ===========================================
// CODEFORCES API SERVICE
// ===========================================

import axios, { AxiosError } from 'axios';
import { CF_API_BASE, CF_USER_STATUS_ENDPOINT } from '@/lib/constants';
import type { CFApiResponse, CFSubmission } from '@/types';

interface FetchSubmissionsResult {
    success: boolean;
    submissions?: CFSubmission[];
    error?: string;
}

/**
 * Fetches all accepted submissions for a Codeforces user
 * @param handle - Codeforces username
 * @returns Array of accepted submissions
 */
export async function fetchUserSubmissions(
    handle: string
): Promise<FetchSubmissionsResult> {
    try {
        const url = `${CF_API_BASE}${CF_USER_STATUS_ENDPOINT}?handle=${encodeURIComponent(handle)}`;

        const response = await axios.get<CFApiResponse>(url, {
            timeout: 10000, // 10 second timeout
        });

        if (response.data.status !== 'OK') {
            return {
                success: false,
                error: response.data.comment || 'Codeforces API error',
            };
        }

        // Filter only accepted submissions
        const acceptedSubmissions = (response.data.result || []).filter(
            (sub: CFSubmission) => sub.verdict === 'OK'
        );

        return {
            success: true,
            submissions: acceptedSubmissions,
        };
    } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 400) {
            return {
                success: false,
                error: `User "${handle}" not found on Codeforces`,
            };
        }

        if (axiosError.code === 'ECONNABORTED') {
            return {
                success: false,
                error: 'Codeforces API timeout - please try again',
            };
        }

        return {
            success: false,
            error: 'Failed to fetch from Codeforces API',
        };
    }
}

/**
 * Fetches submissions for multiple users and merges them
 * @param handles - Array of Codeforces usernames
 * @returns Combined array of accepted submissions from all users
 */
export async function fetchTeamSubmissions(
    handles: string[]
): Promise<FetchSubmissionsResult> {
    try {
        // Fetch all members' submissions in parallel
        const results = await Promise.all(
            handles.map((handle) => fetchUserSubmissions(handle))
        );

        // Check if any requests failed
        const errors = results.filter((r) => !r.success);
        if (errors.length === handles.length) {
            // All failed
            return {
                success: false,
                error: errors[0]?.error || 'Failed to fetch submissions',
            };
        }

        // Merge all submissions
        const allSubmissions: CFSubmission[] = [];
        for (const result of results) {
            if (result.success && result.submissions) {
                allSubmissions.push(...result.submissions);
            }
        }

        // Remove duplicates (same contest + problem index)
        const uniqueProblems = new Map<string, CFSubmission>();
        for (const sub of allSubmissions) {
            if (!sub?.problem?.contestId || !sub?.problem?.index) {
                console.warn('[Codeforces] Invalid submission data, skipping:', sub);
                continue;
            }

            const key = `${sub.problem.contestId}-${sub.problem.index.toUpperCase()}`;
            if (!uniqueProblems.has(key)) {
                uniqueProblems.set(key, sub);
            }
        }

        return {
            success: true,
            submissions: Array.from(uniqueProblems.values()),
        };
    } catch (error) {
        return {
            success: false,
            error: 'Unexpected error fetching team submissions',
        };
    }
}

/**
 * Checks if a problem has been solved
 * @param submissions - Array of accepted submissions
 * @param contestId - Contest ID to check
 * @param problemIndex - Problem index (letter) to check
 * @returns True if problem is solved
 */
export function isProblemSolved(
    submissions: CFSubmission[],
    contestId: number,
    problemIndex: string
): boolean {
    return submissions.some(
        (sub) =>
            String(sub.problem.contestId) === String(contestId) &&
            sub.problem.index.toUpperCase() === problemIndex.toUpperCase()
    );
}