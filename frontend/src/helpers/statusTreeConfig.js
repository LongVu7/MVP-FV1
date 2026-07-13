/**
 * 3-level cascading status tree for Inquiry.
 * statusInteraction → statusGeneral → statusDetail
 *
 * Structure: { [interaction]: { label, children: { [general]: { label, children?: string[] } } } }
 * Leaf nodes with no statusDetail have no `children` array.
 */

export const STATUS_TREE = {
  pending: {
    label: 'Pending',
    children: {
      pending: { label: 'Pending' }
    }
  },
  wrongNumber: {
    label: 'Wrong Number',
    children: {
      wrongNumber: { label: 'Wrong Number' }
    }
  },
  future: {
    label: 'Future',
    children: {
      future: { label: 'Future' }
    }
  },
  interacted: {
    label: 'Interacted',
    children: {
      paymentCompleted: { label: 'Payment Completed' },
      applicationCompleted: {
        label: 'Application Completed',
        children: ['paymentScheduled', 'following', 'cancelled']
      },
      considering: {
        label: 'Considering',
        children: ['applicationScheduled', 'following', 'cancelled']
      },
      interested: {
        label: 'Interested',
        children: [
          'prefersFE',
          'prefersPublicUni',
          'prefersColleges',
          'prefersAbroad',
          'awaitingGPA',
          'awaitingEnglishTest',
          'awaitingFamilyApproval',
          'lowInteresting',
          'awaitingCutOffScores',
          'undecidedCareerPath',
          'tuitionFeeConcerns',
          'justExploring'
        ]
      },
      scheduledCallback: { label: 'Scheduled Callback' }
    }
  },
  notInteracted: {
    label: 'Not Interacted',
    children: {
      noAnswer: { label: 'No Answer' },
      unreachable: { label: 'Unreachable' }
    }
  },
  notInterested: {
    label: 'Not Interested',
    children: {
      notInterested: {
        label: 'Not Interested',
        children: [
          'choseFE',
          'chosePublicUni',
          'choseAnotherInternationalUni',
          'choseColleges',
          'choseStudyingAbroad',
          'notEligible',
          'majorNotSuitable',
          'englishProficiencyConcerns',
          'locationConcerns',
          'notATargetApplicant',
          'stayAtCurrentSchool',
          'reasonUnknown'
        ]
      }
    }
  }
}

/** Human-readable labels for statusDetail keys */
const DETAIL_LABELS = {
  paymentScheduled: 'Payment Scheduled',
  following: 'Following',
  cancelled: 'Cancelled',
  applicationScheduled: 'Application Scheduled',
  prefersFE: 'Prefers FE',
  prefersPublicUni: 'Prefers Public Uni',
  prefersColleges: 'Prefers Colleges',
  prefersAbroad: 'Prefers Abroad',
  awaitingGPA: 'Awaiting GPA',
  awaitingEnglishTest: 'Awaiting English Test',
  awaitingFamilyApproval: 'Awaiting Family Approval',
  lowInteresting: 'Low Interesting',
  awaitingCutOffScores: 'Awaiting Cut-off Scores',
  undecidedCareerPath: 'Undecided Career Path',
  tuitionFeeConcerns: 'Tuition Fee Concerns',
  justExploring: 'Just Exploring',
  choseFE: 'Chose FE',
  chosePublicUni: 'Chose Public Uni',
  choseAnotherInternationalUni: 'Chose Another International Uni',
  choseColleges: 'Chose Colleges',
  choseStudyingAbroad: 'Chose Studying Abroad',
  notEligible: 'Not Eligible',
  majorNotSuitable: 'Major Not Suitable',
  englishProficiencyConcerns: 'English Proficiency Concerns',
  locationConcerns: 'Location Concerns',
  notATargetApplicant: 'Not a Target Applicant',
  stayAtCurrentSchool: 'Stay at Current School',
  reasonUnknown: 'Reason Unknown'
}

/** Returns all statusInteraction options as { value, label } */
export function getInteractionOptions() {
  return Object.entries(STATUS_TREE).map(([value, node]) => ({
    value,
    label: node.label
  }))
}

/** Returns statusGeneral options for a given statusInteraction as { value, label } */
export function getGeneralOptions(interaction) {
  const node = STATUS_TREE[interaction]
  if (!node?.children) return []
  return Object.entries(node.children).map(([value, child]) => ({
    value,
    label: child.label
  }))
}

/** Returns statusDetail options for a given interaction + general as { value, label } */
export function getDetailOptions(interaction, general) {
  const node = STATUS_TREE[interaction]?.children?.[general]
  if (!node?.children) return []
  return node.children.map((value) => ({
    value,
    label: DETAIL_LABELS[value] || value
  }))
}

/**
 * Given a saved statusInteraction + statusGeneral, determine if statusDetail is applicable.
 * Returns true if the general node has detail children.
 */
export function hasDetailOptions(interaction, general) {
  const node = STATUS_TREE[interaction]?.children?.[general]
  return Array.isArray(node?.children) && node.children.length > 0
}
